import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import {
  Chat,
  ChatRow,
  InsertChatMember,
  InsertChatReadRow,
  InsertChatRow,
} from "../types/chats";
import { useCallback, useEffect, useState } from "react";
import { ChatMemberRow } from "types/chatMessages";
import { useProfile } from "./useProfile";
import { Match } from "../types/matches";
export const useChats = (supabase: SupabaseClient) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { profile } = useProfile();

  if (!profile) {
    throw Error("useChats requires profile to be set");
  }

  const hasReadChat = async (chatId: number): Promise<boolean> => {
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
    const insertChatRead: InsertChatReadRow = {
      chat_id: chatId,
      read_at: new Date().toISOString(),
      user_id: profile.id,
    };
    const { data, error } = await supabase
      .from("chat_reads")
      .insert([insertChatRead])
      .single();
    if (!data || error) {
      console.error(
        error
          ? `Supabase error creating chat read: ${error}`
          : "No create chat read data returned"
      );
    }
  };

  const fetchOtherChatMembers = async (chatId: number) => {
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

      const chatPromises = data.map(
        async (row: ChatRow): Promise<Chat | null> => {
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

          const unread = await hasReadChat(row.id);

          return {
            id: row.id,
            lastMessage: row.last_message_text,
            timestamp: row.created_at,
            participants: row.participants,
            name: chatName,
            unread: unread,
          };
        }
      );

      const resolvedChats = await Promise.all(chatPromises);
      setChats(resolvedChats.filter(Boolean) as Chat[]);
    } catch (error) {
      console.error("Uncaught error fetching chats:", error);
    }
  }, [supabase, profile]);

  // Real-time subscriptions to chats and chat_members
  useEffect(() => {
    fetchChats(); // Initial fetch

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
          fetchChats();
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [supabase, fetchChats]);

  const addChatMember = async (chatId: number, memberId: string) => {
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

      // Add current user
      addChatMember(chat.id, profile.id);
      addChatMember(chat.id, otherUserId);

      return chat;
    } catch (error) {
      console.error("Uncaught error creating private chat:", error);
      return;
    }
  };

  return { chats, readChat, fetchChats, createPrivateChat, addChatMember };
};
