import { Database } from "./supabase";

export type ChatMemberRow =
  Database["public"]["Views"]["enriched_chat_members"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type InsertMessage = Database["public"]["Tables"]["messages"]["Insert"];

// Chat members interface
export interface ChatMember {
  memberId: string;
  memberName?: string | null;
  memberAvatar?: string | null;
}

// Map DB row to ChatMember interface
export const memberRowToMember = (memberRow: ChatMemberRow): ChatMember => {
  console.info(memberRow);
  if (!memberRow.user_id) {
    // Should never happen - required since using a View
    throw new Error("Member row error: missing user ID");
  }
  if (!memberRow.name) {
    console.warn("Member row warning: missing user name");
  }
  return {
    memberId: memberRow.user_id,
    memberName: memberRow.name,
    memberAvatar: memberRow.avatar_url,
  };
};

export enum MessageStatus {
  Failed = "Failed",
  Loading = "Loading",
  Succeeded = "Succeeded",
}

// Chat messages interface
export interface Message {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  senderName?: string | null;
  senderAvatar?: string | null;
  messageStatus?: MessageStatus;
}

// Map DB row to Message interface
export const messageRowToMessage = (
  messageRow: MessageRow,
  senderName?: string | null,
  senderAvatar?: string | null
): Message => {
  if (!messageRow.content) {
    throw new Error("Invalid message row: empty content");
  }

  return {
    id: messageRow.id,
    text: messageRow.content,
    senderId: messageRow.user_id,
    timestamp: messageRow.sent_at,
    senderName: senderName,
    senderAvatar: senderAvatar,
    messageStatus: MessageStatus.Succeeded,
  };
};
