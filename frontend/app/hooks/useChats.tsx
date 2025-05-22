// ChatContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { Chat, InsertChatRow, InsertChatMember } from "../types/chats";
import { useProfile } from "./useProfile";
import { ChatMemberRow } from "types/chatMessages";

interface ChatContextType {
  chats: Chat[];
  readChat: (chatId: number) => Promise<any[] | undefined>;
  fetchChats: () => Promise<void>;
  createPrivateChat: (otherUserId: string) => Promise<Chat | undefined>;
  addChatMember: (
    chatId: number,
    memberId: string
  ) => Promise<ChatMemberRow | undefined>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
  supabase: SupabaseClient;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  supabase,
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useProfile();

  const readChat = async (chatId: number) => {
    if (!profile) return;

    // First, get message IDs that have been read by this user
    const { data: readMessageIds, error: readError } = await supabase
      .from("message_reads")
      .select("message_id")
      .eq("user_id", profile.id);

    if (readError) {
      console.error("Failed to fetch read messages:", readError);
      return;
    }

    // Extract the message IDs into an array
    const readIds = readMessageIds?.map((row) => row.message_id) || [];

    // Get messages that haven't been read by this user yet
    let query = supabase.from("messages").select("id").eq("chat_id", chatId);

    // Only add the not filter if there are read messages
    if (readIds.length > 0) {
      query = query.not("id", "in", `(${readIds.join(",")})`);
    }

    const { data: messageData, error: messageError } = await query;

    if (messageError) {
      console.error("Failed to fetch unread messages:", messageError);
      return;
    }

    // If no unread messages, nothing to do
    if (!messageData || messageData.length === 0) {
      return;
    }

    // Create read records
    const reads = messageData.map((row) => ({
      created_at: new Date().toISOString(),
      message_id: row.id,
      user_id: profile.id,
    }));

    const { data: readData, error: insertError } = await supabase
      .from("message_reads")
      .insert(reads)
      .select();

    if (insertError) {
      console.error("Failed to mark messages as read:", insertError);
      return;
    }

    return readData;
  };

  const hasReadChat = async (chatId: number) => {
    if (!profile) return false;

    // First, get message IDs that have been read by this user
    const { data: readMessageIds, error: readError } = await supabase
      .from("message_reads")
      .select("message_id")
      .eq("user_id", profile.id);

    if (readError) {
      console.error("Failed to fetch read messages:", readError);
      return false;
    }

    // Extract the message IDs into an array
    const readIds = readMessageIds?.map((row) => row.message_id) || [];

    // Check if there are any unread messages for this user in this chat
    let query = supabase
      .from("messages")
      .select("id")
      .eq("chat_id", chatId)
      .limit(1);

    // Only add the not filter if there are read messages
    if (readIds.length > 0) {
      query = query.not("id", "in", `(${readIds.join(",")})`);
    }

    const { data: unreadMessages, error } = await query;

    if (error) {
      console.error("Failed to check for unread messages:", error);
      return false;
    }

    const read = !unreadMessages || unreadMessages.length === 0;
    console.info("Chat read:", read);

    // If no unread messages found, chat is fully read
    return read;
  };
  const fetchOtherChatMembers = async (chatId: number) => {
    if (!profile) return [];

    const { data, error } = await supabase
      .from("enriched_chat_members")
      .select("name")
      .eq("chat_id", chatId)
      .neq("user_id", profile.id);

    if (error || !data) {
      throw error || new Error("No other member data returned");
    }

    return data as ChatMemberRow[];
  };

  const fetchChats = useCallback(async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      console.info("Current User:", profile.id);
      const { data, error } = await supabase
        .from("enriched_chats")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching chats:", error);
        return;
      }

      if (!data) {
        console.warn("No chat data returned");
        return;
      }

      const chatPromises = data.map(async (row): Promise<Chat | null> => {
        if (!row.id || !row.participants) {
          console.error("Missing row ID or participants");
          return null;
        }

        const otherMembers = await fetchOtherChatMembers(row.id);
        let chatName = "";

        if (row.is_group) {
          if (row.chat_name) {
            chatName = row.chat_name;
          } else {
            const names = otherMembers.map((m) => m.name).filter(Boolean);
            chatName = names.join(", ");
            if (chatName.length > 30) {
              chatName = chatName.slice(0, 27) + "...";
            }
          }
        } else {
          chatName = otherMembers[0]?.name || row.chat_name || "Unnamed Chat";
        }

        const hasRead = await hasReadChat(row.id);

        return {
          id: row.id,
          lastMessage: row.last_message_text,
          timestamp: row.created_at,
          participants: row.participants,
          name: chatName,
          unread: !hasRead,
          isAi: row.is_ai,
        };
      });

      const resolvedChats = await Promise.all(chatPromises);
      setChats(resolvedChats.filter(Boolean) as Chat[]);
    } catch (error) {
      console.error("Uncaught error fetching chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, profile]);

  // Initialize subscription when profile is available
  useEffect(() => {
    if (!profile) return;

    fetchChats();

    // Clean up existing channel
    if (channel) {
      channel.unsubscribe();
    }

    const newChannel = supabase
      .channel("realtime:chats_and_members")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
        },
        () => {
          console.info("Chats table changed");
          fetchChats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_members",
        },
        () => {
          console.info("Chat members table changed");
          fetchChats();
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [supabase, fetchChats, profile]);

  const addChatMember = async (chatId: number, memberId: string) => {
    if (!profile) return;

    try {
      const insertChatMember: InsertChatMember = {
        chat_id: chatId,
        user_id: memberId,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("chat_members")
        .insert([insertChatMember])
        .select();

      if (error || !data) {
        console.error(
          error
            ? `Supabase error creating chat member: ${error}`
            : "No create chat member data returned"
        );
        return;
      }
      return data[0] as ChatMemberRow;
    } catch (error) {
      console.error("Uncaught error creating chat member:", error);
      return;
    }
  };

  const createPrivateChat = async (otherUserId: string) => {
    if (!profile) return;

    try {
      const insertChat: InsertChatRow = {
        created_at: new Date().toISOString(),
        is_group: false,
      };

      const { data, error } = await supabase
        .from("chats")
        .insert([insertChat])
        .select();

      if (error) {
        console.error("Supabase error creating private chat:", error);
        return;
      }

      if (!data) {
        console.warn("No create private chat data returned");
        return;
      }

      const chat = data[0] as Chat;

      // Add current user and other user
      await addChatMember(chat.id, profile.id);
      await addChatMember(chat.id, otherUserId);

      return chat;
    } catch (error) {
      console.error("Uncaught error creating private chat:", error);
      return;
    }
  };

  const value = {
    chats,
    readChat,
    fetchChats,
    createPrivateChat,
    addChatMember,
    isLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChats = () => {
  const { chats, isLoading, readChat } = useChatContext();
  return { chats, isLoading, readChat };
};
