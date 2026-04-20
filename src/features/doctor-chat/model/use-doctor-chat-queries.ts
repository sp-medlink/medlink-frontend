"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppRole, useCurrentUser } from "@/entities/session";

import {
  deleteChatAsDoctor,
  deleteChatAsPatient,
  fetchChatMessages,
  fetchUnifiedInboxForDoctor,
  fetchUnifiedInboxForPatient,
  sendChatMessage,
} from "../api/chat-api";
import { doctorChatKeys } from "../api/query-keys";
import type {
  ChatMessageDto,
  GetManyChatMessagesResponse,
  SendChatMessageResponse,
} from "../api/types";

/** Inbox list: keep warm so reopening chat / full page shows cache immediately. */
export const CHAT_INBOX_STALE_MS = 120_000;
/** Thread messages: show last fetch immediately when reopening a chat. */
export const CHAT_MESSAGES_STALE_MS = 60_000;

/** Prefix marking an optimistic (client-generated) message id. */
export const PENDING_MSG_PREFIX = "pending:";

export function isPendingMessage(msg: ChatMessageDto): boolean {
  return msg.id.startsWith(PENDING_MSG_PREFIX);
}

export interface OptimisticMessageMeta {
  status: "sending" | "failed";
  /** Original draft so the retry flow can re-send verbatim. */
  draft: string;
}

/**
 * Parallel store of per-message status for optimistic bubbles. Kept in
 * the query cache as a sibling entry so we don't pollute message DTOs
 * with client-only fields that'd get wiped on refetch.
 */
export const optimisticMetaKey = (chatId: string) =>
  [...doctorChatKeys.messages(chatId), "__pending"] as const;

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

interface SendVariables {
  text: string;
  /** Provided when the caller is retrying a prior failed send. */
  retryOfPendingId?: string;
}

/**
 * Optimistic message send.
 *
 *   - `onMutate` inserts a `pending:` bubble into the messages cache
 *     and records its status in a sibling pending-meta cache so the
 *     widget can render it as "sending".
 *   - `onSuccess` drops the optimistic entry and lets the server
 *     response flow in via the invalidation-triggered refetch. The
 *     server's message (real id, server timestamp) becomes canonical.
 *   - `onError` flips the bubble to "failed" so the widget can offer
 *     a retry. We don't remove it — the user needs to see that it
 *     didn't land.
 */
export function useSendChatMessageMutation(chatId: string | null) {
  const qc = useQueryClient();
  const currentUser = useCurrentUser();

  return useMutation<
    SendChatMessageResponse,
    Error,
    SendVariables,
    { tempId: string } | undefined
  >({
    mutationFn: ({ text }: SendVariables) =>
      sendChatMessage(chatId!, { text_content: text.trim() }),
    onMutate: async ({ text, retryOfPendingId }) => {
      if (!chatId || !currentUser?.id) return undefined;

      const messagesKey = doctorChatKeys.messages(chatId);
      const metaKey = optimisticMetaKey(chatId);

      await qc.cancelQueries({ queryKey: messagesKey });

      const tempId = retryOfPendingId ?? `${PENDING_MSG_PREFIX}${crypto.randomUUID()}`;
      const nowIso = new Date().toISOString();

      const optimistic: ChatMessageDto = {
        id: tempId,
        chat_id: chatId,
        sender_user_id: currentUser.id,
        text_content: text,
        attachments: [],
        created_at: nowIso,
        updated_at: nowIso,
      };

      qc.setQueryData<GetManyChatMessagesResponse>(messagesKey, (prev) => {
        const existing = prev?.messages ?? [];
        if (retryOfPendingId) {
          // Retry path — keep the same bubble, just flip back to sending.
          return {
            messages: existing.map((m) =>
              m.id === retryOfPendingId ? optimistic : m,
            ),
          };
        }
        return { messages: [...existing, optimistic] };
      });

      qc.setQueryData<Record<string, OptimisticMessageMeta>>(metaKey, (prev) => ({
        ...(prev ?? {}),
        [tempId]: { status: "sending", draft: text },
      }));

      return { tempId };
    },
    onSuccess: (_data, _vars, ctx) => {
      if (!chatId) return;

      const metaKey = optimisticMetaKey(chatId);
      const messagesKey = doctorChatKeys.messages(chatId);

      if (ctx?.tempId) {
        qc.setQueryData<GetManyChatMessagesResponse>(messagesKey, (prev) => {
          if (!prev) return prev;
          return {
            messages: prev.messages.filter((m) => m.id !== ctx.tempId),
          };
        });
        qc.setQueryData<Record<string, OptimisticMessageMeta>>(
          metaKey,
          (prev) => {
            if (!prev || !(ctx.tempId in prev)) return prev;
            const copy = { ...prev };
            delete copy[ctx.tempId];
            return copy;
          },
        );
      }

      void qc.invalidateQueries({ queryKey: messagesKey });
      void qc.invalidateQueries({ queryKey: doctorChatKeys.all() });
    },
    onError: (_err, _vars, ctx) => {
      if (!chatId || !ctx?.tempId) return;
      const metaKey = optimisticMetaKey(chatId);
      qc.setQueryData<Record<string, OptimisticMessageMeta>>(metaKey, (prev) => ({
        ...(prev ?? {}),
        [ctx.tempId]: {
          status: "failed",
          draft: (prev?.[ctx.tempId]?.draft ?? "") || "",
        },
      }));
    },
  });
}

/** Remove a failed optimistic bubble — "discard" action from the retry UI. */
export function useDiscardPendingMessage(chatId: string | null) {
  const qc = useQueryClient();
  return (tempId: string) => {
    if (!chatId) return;
    qc.setQueryData<GetManyChatMessagesResponse>(
      doctorChatKeys.messages(chatId),
      (prev) => {
        if (!prev) return prev;
        return { messages: prev.messages.filter((m) => m.id !== tempId) };
      },
    );
    qc.setQueryData<Record<string, OptimisticMessageMeta>>(
      optimisticMetaKey(chatId),
      (prev) => {
        if (!prev) return prev;
        const copy = { ...prev };
        delete copy[tempId];
        return copy;
      },
    );
  };
}

/**
 * Reactive read of the per-message pending-meta map. Backed by the
 * query cache so updates from `onMutate`/`onError` trigger re-renders.
 * Uses `staleTime: Infinity` and an inert queryFn because the data is
 * never fetched — only written via setQueryData.
 */
export function usePendingMessagesMeta(
  chatId: string | null,
): Record<string, OptimisticMessageMeta> {
  const { data } = useQuery<Record<string, OptimisticMessageMeta>>({
    queryKey: chatId
      ? optimisticMetaKey(chatId)
      : ["doctor-chat", "messages", "none", "__pending"],
    queryFn: () => Promise.resolve({}),
    enabled: !!chatId,
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
  });
  return data ?? {};
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
