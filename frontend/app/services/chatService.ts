import { secondsInDay } from "date-fns/constants";
import { getSupabaseClient } from "../hooks/supabase";
import { Database } from "types/supabase";
const supabase = getSupabaseClient();
import { useApi } from "../hooks/useAPI";
import { BASE_URL } from "../config/api";
import { ChatRow } from "types/chats";

type InsertChat = Partial<Database["public"]["Tables"]["chats"]["Insert"]>;
type InsertChatUser = Partial<
  Database["public"]["Tables"]["chat_members"]["Insert"]
>;
type InsertMessage = Partial<
  Database["public"]["Tables"]["messages"]["Insert"]
>;

interface Chat {
  id: number;
  name: string;
  avatar?: string;
  initials?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  isGroup?: boolean;
  participants?: number;
}

export async function createChat(
  accessToken: string | null,
  userIds: string[],
  name?: string
) {
  try {
    const url = `${BASE_URL}/chats/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        created_at: new Date().toISOString(),
        user_ids: userIds,
        name: name || null,
      }),
    });

    if (!response.ok) throw new Error("Failed chat creation");

    const responseData = await response.json();
    return responseData.data as ChatRow;
  } catch (error) {
    console.error("Failed to create chat:", error);
    return;
  }
}
export async function createAIChat(accessToken: string | null) {
  try {
    const url = `${BASE_URL}/chats/create/ai`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed AI chat creation");

    const responseData = await response.json();
    return responseData.data as ChatRow;
  } catch (error) {
    console.error("Failed to create chat:", error);
    return;
  }
}

export async function chatWithBot(
  accessToken: string | null,
  message: string,
  chatId: number
): Promise<{ success: boolean; message: string; error?: string } | undefined> {
  try {
    const url = `${BASE_URL}/chatbot`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        chat_id: chatId,
      }),
    });

    if (!response.ok) throw new Error("Failed to get chatbot response");

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Failed to communicate with chatbot:", error);
    return {
      success: false,
      message: "Failed to communicate with chatbot",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createPrivateChatRPC(
  firstUserId: string,
  secondUserId: string
) {
  try {
    const { data: chatId, error } = await supabase.rpc("create_private_chat", {
      _first_user_id: firstUserId,
      _second_user_id: secondUserId,
    });

    if (error) throw error;

    return { success: true, chatId: chatId };
  } catch (error) {
    console.error("Failed to create private chat:", error);
    return { success: false, error: error };
  }
}

export async function testAuth(accessToken: string | null) {
  const response = await fetch(`${BASE_URL}/test`, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  if (!response.ok) throw new Error("Failed test route");
  const json = await response.json();
  return json;
}

function unpackChats(apiChats: any) {
  const chats: Chat[] = apiChats.map((apiChat: any) => {
    return {
      id: apiChat.id,
      name: apiChat.name || "Unknown chat",
      avatar: apiChat.avatar,
      lastMessage: apiChat.last_message || "",
      timetstamp: apiChat.last_message_timestamp || new Date().toISOString(),
      isGroup: false,
      participants: 2,
    };
  });

  return chats;
}

export async function getUserChats(accessToken: string | null) {
  const url = `${BASE_URL}/chats/single`;
  console.log(url);
  console.log(accessToken);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  console.log("Response", response);

  // If not response ok, thow error
  if (!response.ok) throw new Error("Failed to fetch user private chats");

  // Unpack data
  const responseData = await response.json();
  console.log("Received response data", responseData);
  const apiChats = responseData.data;

  return unpackChats(apiChats);
}

export async function getUserGroupChats(accessToken: string | null) {
  const response = await fetch(`${BASE_URL}/chats/group`, {
    method: "GET",
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  // If not response ok, thow error
  if (!response.ok) throw new Error("Failed to fetch user group chats");

  // Unpack data
  const responseData = await response.json();
  const apiChats = responseData.data;

  return unpackChats(apiChats);
}

interface Message {
  id: number;
  text: string;
  timestamp: string;
  senderId: number;
  senderName?: string;
  senderAvatar?: string;
}

export interface ApiMessage {
  text: string;
  timestamp: string;
}

function unpackMessages(apiMessages: any) {
  const messages: Message[] = apiMessages.map((apiMessage: any) => {
    return {
      id: apiMessage.id,
      text: apiMessage.content,
      timestamp: apiMessage.sent_at,
      senderId: apiMessage.user_id,
      senderName: apiMessage.name,
      senderAvatar: apiMessage.avatar_url,
    };
  });

  return messages;
}

export async function getChatMessages(
  accessToken: string | null,
  chatId: number
) {
  console.log("We are calling the method");
  const response = await fetch(`${BASE_URL}/chats/messages/${chatId}`, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  // If not response ok, thow error
  if (!response.ok) throw new Error("Failed to fetch chat messages");

  // Unpack data
  const responseData = await response.json();
  const apiMessages = responseData.data;

  const messages = unpackMessages(apiMessages);

  return unpackMessages(apiMessages);
}

export async function sendChatMessage(
  accessToken: string | null,
  chat_id: number,
  apiMessage: ApiMessage
) {
  const response = await fetch(`${BASE_URL}/chats/messages/${chat_id}`, {
    method: "POST",
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiMessage),
  });

  // If not response ok, throw error
  if (!response.ok) throw new Error("API call failed");

  // If not status is true
  const responseData = await response.json();
  if (!responseData.success) throw Error("Message creation failed");

  // Return message
  console.log(responseData.data);
  return responseData.data;
}
