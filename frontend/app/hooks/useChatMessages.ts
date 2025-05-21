import { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import {
  Message,
  MessageRow,
  messageRowToMessage,
  ChatMember,
  ChatMemberRow,
  memberRowToMember,
  InsertMessage,
  MessageStatus,
} from "../types/chatMessages";
import { useProfile } from "./useProfile";

export const useChatMessages = (supabase: SupabaseClient, chatId: number) => {
  const { profile } = useProfile();
  const [members, setMembers] = useState<Record<string, ChatMember>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [_, setChannels] = useState<{
    members: RealtimeChannel | null;
    messages: RealtimeChannel | null;
  }>({ members: null, messages: null });

  if (!profile) {
    throw Error("useChatMessages requires profile to be set");
  }

  // Fetch chat members
  const fetchMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("enriched_chat_members")
        .select("id, name, avatar_url, user_id")
        .eq("chat_id", chatId);

      // If error, log and make no update
      if (error) {
        console.error("Supabase error fetching chat members:", error);
        return;
      }

      // If no data returned, log and make no update
      if (!data) {
        console.warn("No chat member data returned");
        return;
      }

      console.info("Member data:", data);

      // Map DB rows to members update state
      const newMembers = data.reduce((acc, row) => {
        const member = memberRowToMember(row as ChatMemberRow);
        acc[member.memberId] = member;
        return acc;
      }, {} as Record<string, ChatMember>);
      setMembers(newMembers);
    } catch (error) {
      console.error("Uncaught error fetching chat members:", error);
      return;
    }
  }, [chatId, supabase]);

  // Fetch chat members
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("sent_at", { ascending: true });

      // If error, log and make no update
      if (error) {
        console.error("Supabase error fetching chat messages:", error);
        return;
      }

      // If no data returned, log and make no update
      if (!data) {
        console.warn("No chat message data returned");
        return;
      }

      console.log(data);

      // Map DB row to message and update state
      const newMessages = data.map((row) => {
        const member = members[row.user_id];
        return messageRowToMessage(
          row as MessageRow,
          member?.memberName,
          member?.memberAvatar
        );
      });
      setMessages(newMessages);
    } catch (error) {
      console.error("Uncaught error fetching chat messages:", error);
      return;
    }
  }, [chatId, supabase, members]);

  const updateLastMessage = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from("chats")
        .update({ last_message_id: messageId })
        .eq("id", chatId);

      if (error) throw error;
    } catch (error) {
      console.log("Error updating chat last message", error);
    }
  };

  const sendMessage = async (text: string) => {
    try {
      // Create a message optimistically
      const sentAt = new Date().toISOString();

      // Insert message to database
      const insertMessage = {
        chat_id: chatId,
        content: text,
        user_id: profile.id,
        sent_at: sentAt,
      } as InsertMessage;
      const { data, error } = await supabase
        .from("messages")
        .insert([insertMessage])
        .select();

      // If error, update temporary message to failed
      if (error || !data) {
        console.error(
          error
            ? `Supabase error creating chat message ${error}`
            : "No create message data returned"
        );
        return;
      }

      // Update messages with server message
      const serverMessageRow = data[0] as MessageRow;
      const member = members[serverMessageRow.user_id];
      const serverMessage = messageRowToMessage(
        serverMessageRow,
        member?.memberName,
        member?.memberAvatar
      );
      setMessages((prev) => [...prev, serverMessage]);

      // Update last message for chat
      await updateLastMessage(serverMessage.id);
    } catch (error) {
      console.error("Uncaught error sending chat message", error);
      return;
    }
  };

  // Members subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat_members:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_members",
          filter: `chat_id=eq.${chatId}`,
        },
        (_) => fetchMembers()
      )
      .subscribe();

    // Update channel and fetch members on mount
    setChannels((prev) => ({ ...prev, members: channel }));
    fetchMembers();

    // Unsubscribe on dismount
    return () => {
      channel.unsubscribe();
    };
  }, [chatId, supabase, fetchMembers]);

  // Messages subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat_messages:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId},user_id=neq.${profile.id}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          const member = members[row.user_id];
          setMessages((prev) => [
            ...prev,
            messageRowToMessage(row, member?.memberName, member?.memberAvatar),
          ]);
        }
      )
      .subscribe();

    // Update channel and fetch messages on mount
    setChannels((prev) => ({ ...prev, messages: channel }));
    fetchMessages();

    // Unsubscribe on dismount
    return () => {
      channel.unsubscribe();
    };
  }, [chatId, supabase, members, fetchMessages]);

  return { members, messages, sendMessage };
};
