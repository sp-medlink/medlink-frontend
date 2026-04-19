"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchChatMessages, fetchMyChats, sendChatMessage } from "../api/chat-api";
import { doctorChatKeys } from "../api/query-keys";

/** User's conversations; backend orders by `last_message_created_at DESC`. */
export function useMyChatsQuery(enabled: boolean) {
  return useQuery({
    queryKey: doctorChatKeys.myChats(),
    queryFn: fetchMyChats,
    enabled,
    staleTime: 30_000,
  });
}

export function useChatMessagesQuery(chatId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: chatId ? doctorChatKeys.messages(chatId) : ["doctor-chat", "messages", "none"],
    queryFn: () => fetchChatMessages(chatId!),
    enabled: Boolean(enabled && chatId),
    staleTime: 0,
  });
}

export function useSendChatMessageMutation(chatId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      sendChatMessage(chatId!, { text_content: text.trim() }),
    onSuccess: () => {
      if (chatId) {
        void qc.invalidateQueries({ queryKey: doctorChatKeys.messages(chatId) });
        void qc.invalidateQueries({ queryKey: doctorChatKeys.myChats() });
      }
    },
  });
}
