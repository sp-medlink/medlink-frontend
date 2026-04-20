"use client";

import { useMemo } from "react";

import type { UnifiedInboxRow } from "../api/types";
import { useDoctorChatUiStore } from "./chat-ui-store";

export interface ChatUnreadMap {
  /** Per-chat flag: `true` when `lastMessageCreatedAt > lastReadAt[chatId]`. */
  byChatId: Record<string, boolean>;
  /** Total chats with unread activity — used for the FAB badge. */
  total: number;
}

/**
 * Derives unread state entirely on the client from persisted
 * `lastReadAt` markers. The backend doesn't expose a read-state API
 * yet, so "unread" = "has a message newer than the last time the user
 * opened this chat on this browser". Good enough for a single-device
 * product story; trivially swappable for a server-backed field later.
 */
export function useChatUnread(rows: UnifiedInboxRow[]): ChatUnreadMap {
  const lastReadAt = useDoctorChatUiStore((s) => s.lastReadAt);

  return useMemo(() => {
    const byChatId: Record<string, boolean> = {};
    let total = 0;
    for (const row of rows) {
      if (!row.lastMessageCreatedAt) continue;
      const last = lastReadAt[row.chatId];
      const unread = !last || row.lastMessageCreatedAt > last;
      byChatId[row.chatId] = unread;
      if (unread) total += 1;
    }
    return { byChatId, total };
  }, [rows, lastReadAt]);
}
