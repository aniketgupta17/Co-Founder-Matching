import { Database } from "./supabase";

export type ChatRow = Database["public"]["Views"]["enriched_chats"]["Row"];
export type InsertChatReadRow =
  Database["public"]["Tables"]["chat_reads"]["Insert"];
export type InsertChatRow = Database["public"]["Tables"]["chats"]["Insert"];
export type InsertChatMember =
  Database["public"]["Tables"]["chat_members"]["Insert"];

export interface Chat {
  id: number;
  name: string;
  lastMessage?: string | null;
  timestamp?: string | null;
  isGroup?: boolean;
  avatar?: string | null;
  initials?: string;
  unread: boolean;
  participants?: number;
}

export const chatRowToChat = (
  chatRow: ChatRow,
  unread: boolean,
  chatName?: string
): Chat => {
  if (!chatRow.id) {
    // Should never happen - required since using a View
    throw new Error("Chat row error: missing ID");
  }

  // Should never happen - required since using a View
  if (!chatRow.participants) {
    throw new Error("Chat row error: missing participants");
  }

  // Set chat name
  const name = chatRow.chat_name || chatRow.user_name || chatName;
  if (!name) {
    throw new Error(
      "Chat name, last message user name, and supplied chat name are empty"
    );
  }

  return {
    id: chatRow.id,
    name: name,
    lastMessage: chatRow.last_message_text,
    timestamp: chatRow.sent_at,
    isGroup: chatRow.participants > 2,
    unread: unread,
    avatar: chatRow.avatar_url || null,
    participants: chatRow.participants,
  };
};
