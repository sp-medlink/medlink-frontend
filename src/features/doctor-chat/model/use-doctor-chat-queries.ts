"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppRole } from "@/entities/session";

import {
  deleteChatAsDoctor,
  deleteChatAsPatient,
  fetchChatMessages,
  fetchUnifiedInboxForDoctor,
  fetchUnifiedInboxForPatient,
  sendChatMessage,
} from "../api/chat-api";
import { doctorChatKeys } from "../api/query-keys";

/** Inbox list: keep warm so reopening chat / full page shows cache immediately. */
export const CHAT_INBOX_STALE_MS = 120_000;
/** Thread messages: show last fetch immediately when reopening a chat. */
export const CHAT_MESSAGES_STALE_MS = 60_000;

export function useUnifiedInboxQuery(enabled: boolean) {
  const role = useAppRole();
  return useQuery({
    queryKey: doctorChatKeys.inbox(role ?? "none"),
    queryFn: async () => {
      if (role === "doctor") return fetchUnifiedInboxForDoctor();
      if (role === "patient") return fetchUnifiedInboxForPatient();
      return [];
    },
    enabled: Boolean(enabled && (role === "doctor" || role === "patient")),
    staleTime: CHAT_INBOX_STALE_MS,
    gcTime: 30 * 60 * 1000,
  });
}

export function useChatMessagesQuery(chatId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: chatId ? doctorChatKeys.messages(chatId) : ["doctor-chat", "messages", "none"],
    queryFn: () => fetchChatMessages(chatId!),
    enabled: Boolean(enabled && chatId),
    staleTime: CHAT_MESSAGES_STALE_MS,
    gcTime: 15 * 60 * 1000,
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
        void qc.invalidateQueries({ queryKey: doctorChatKeys.all() });
      }
    },
  });
}

export function useDeleteChatMutation() {
  const qc = useQueryClient();
  const role = useAppRole();
  return useMutation({
    mutationFn: async (input: {
      chatId: string;
      doctorDepartmentId?: string;
    }) => {
      if (role === "doctor") {
        if (!input.doctorDepartmentId) {
          throw new Error("doctorDepartmentId required");
        }
        await deleteChatAsDoctor(input.doctorDepartmentId, input.chatId);
        return;
      }
      await deleteChatAsPatient(input.chatId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: doctorChatKeys.all() });
    },
  });
}
