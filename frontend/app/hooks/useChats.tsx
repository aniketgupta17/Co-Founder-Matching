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
  readChat: (chatId: number) => Promise<void>;
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

  const hasReadChat = async (
    chatId: number,
    lastMessageId: string | null,
    userId: string | null
  ): Promise<boolean> => {
    if (!lastMessageId || !profile) {
      return true;
    }

    if (userId === profile.id) {
      return true;
    }

    const { data, error } = await supabase.rpc("has_user_read_chat", {
      _chat_id: chatId,
    });

    if (error) {
      console.error("Supabase error checking read:", error);
      return false;
    }
    return data;
  };

  const readChat = async (chatId: number) => {
    if (!profile) return;

    const insertChatRead = {
      chat_id: chatId,
      read_at: new Date().toISOString(),
      user_id: profile.id,
    };

    const { data, error } = await supabase
      .from("chat_reads")
      .insert([insertChatRead])
      .select();

    if (!data || error) {
      console.error(
        error
          ? `Supabase error creating chat read: ${error}`
          : "No create chat read data returned"
      );
    }
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

        const hasRead = await hasReadChat(
          row.id,
          row.last_message_id,
          row.user_id
        );

        return {
          id: row.id,
          lastMessage: row.last_message_text,
          timestamp: row.created_at,
          participants: row.participants,
          name: chatName,
          unread: !hasRead,
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
