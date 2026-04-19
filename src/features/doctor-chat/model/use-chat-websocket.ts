"use client";

import { useQueryClient } from "@tanstack/react-query";
import useWebSocket from "react-use-websocket";

import { getSessionToken } from "@/entities/session";
import { wsUrl } from "@/shared/ws/websocket-url";

import { doctorChatKeys } from "../api/query-keys";

/**
 * Subscribes to chat room events; invalidates message + inbox caches on new data.
 * Backend may require `?token=` — see docs/auth.md.
 */
export function useChatRoomWebSocket(
  chatId: string | null,
  enabled: boolean,
): void {
  const qc = useQueryClient();
  const token = getSessionToken();
  const url =
    chatId && enabled && token
      ? wsUrl(`/user/ws/chats/${chatId}`, token)
      : null;

  useWebSocket(url, {
    shouldReconnect: () => Boolean(chatId && token),
    reconnectAttempts: 8,
    reconnectInterval: 3000,
    onMessage: (evt) => {
      try {
        const data = JSON.parse(String(evt.data)) as { type?: string };
        if (
          data.type === "message.created" ||
          data.type === "message.updated" ||
          data.type === "message.deleted"
        ) {
          if (chatId) {
            void qc.invalidateQueries({
              queryKey: doctorChatKeys.messages(chatId),
            });
          }
          void qc.invalidateQueries({ queryKey: doctorChatKeys.all() });
        }
      } catch {
        /* non-JSON */
      }
    },
  });
}
