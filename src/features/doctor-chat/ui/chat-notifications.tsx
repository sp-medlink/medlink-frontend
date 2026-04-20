"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useWebSocket from "react-use-websocket";
import { toast } from "sonner";

import {
  getSessionToken,
  useAppRole,
  useCurrentUser,
  useIsAuthenticated,
  useIsSessionHydrated,
} from "@/entities/session";
import { wsUrl } from "@/shared/ws/websocket-url";

import { doctorChatKeys } from "../api/query-keys";
import type { UnifiedInboxRow } from "../api/types";
import {
  canUseDesktopNotifications,
  playIncomingMessageSound,
  useChatPrefsStore,
} from "../model/chat-prefs-store";
import {
  hydrateChatUiFromStorage,
  useDoctorChatUiStore,
} from "../model/chat-ui-store";
import { useUnifiedInboxQuery } from "../model/use-doctor-chat-queries";

interface IncomingPayload {
  id?: string;
  chat_id?: string;
  sender_user_id?: string;
  text_content?: string;
}

interface IncomingEvent {
  type?: string;
  payload?: IncomingPayload;
}

/**
 * Maximum characters to render in the toast body before trimming. Keeps
 * multi-paragraph messages from taking over the whole viewport.
 */
const TOAST_PREVIEW_MAX = 140;

function truncateForPreview(raw: string): string {
  const collapsed = raw.replace(/\s+/g, " ").trim();
  if (collapsed.length <= TOAST_PREVIEW_MAX) return collapsed;
  return `${collapsed.slice(0, TOAST_PREVIEW_MAX - 1)}…`;
}

/**
 * Single chat-room listener. Opens a dedicated WebSocket to this chat,
 * mirrors what the in-widget hook does for cache invalidation, and also
 * fires a toast for incoming peer messages *when the user isn't already
 * looking at that conversation*. Rendering nothing.
 */
function ChatRoomNotifier({ row }: { row: UnifiedInboxRow }) {
  const qc = useQueryClient();
  const token = getSessionToken();
  const currentUser = useCurrentUser();
  const url =
    token && row.chatId
      ? wsUrl(`/user/ws/chats/${row.chatId}`, token)
      : null;

  useWebSocket(url, {
    shouldReconnect: () => Boolean(token && row.chatId),
    reconnectAttempts: 8,
    reconnectInterval: 3000,
    onMessage: (evt) => {
      let data: IncomingEvent;
      try {
        data = JSON.parse(String(evt.data)) as IncomingEvent;
      } catch {
        return;
      }

      if (
        data.type !== "message.created" &&
        data.type !== "message.updated" &&
        data.type !== "message.deleted"
      ) {
        return;
      }

      // Every event invalidates — inbox ordering changes on any new or
      // deleted message, and messages cache has to refetch.
      void qc.invalidateQueries({
        queryKey: doctorChatKeys.messages(row.chatId),
      });
      void qc.invalidateQueries({ queryKey: doctorChatKeys.all() });

      if (data.type !== "message.created") return;

      const payload = data.payload;
      if (!payload) return;

      // Don't toast yourself when your own message echoes back.
      const myId = currentUser?.id;
      if (myId && payload.sender_user_id === myId) return;

      // Read the freshest store state — onMessage closure can be stale
      // w.r.t. view/selectedChatId if the user navigates between chats.
      const { isOpen, view, selectedChatId, open, openChat } =
        useDoctorChatUiStore.getState();

      // Suppress when this chat is already in view (dock or page widget
      // share the same `selectedChatId`). Messages stream into the
      // thread directly; a toast would be noise.
      const viewingThisChat =
        view === "chat" && selectedChatId === row.chatId;
      if (viewingThisChat) return;

      const preview = payload.text_content
        ? truncateForPreview(payload.text_content)
        : "Sent an attachment";
      const title = row.peerDisplayName || "New message";

      toast.message(title, {
        description: preview,
        duration: 8000,
        action: {
          label: "Open",
          onClick: () => {
            if (!isOpen) open();
            openChat(row.chatId);
          },
        },
      });

      // Sound ping — silently no-ops if the user muted it or the
      // browser blocks autoplay (e.g., tab never received a gesture).
      playIncomingMessageSound();

      // Native desktop notification — only when the user explicitly
      // enabled it AND the tab isn't already focused (no point
      // double-signalling when the user's eyes are on the window).
      if (
        canUseDesktopNotifications() &&
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      ) {
        try {
          // Re-firing the same tag replaces the prior one; avoids a
          // pileup when multiple messages arrive back-to-back.
          const n = new Notification(title, {
            body: preview,
            tag: `chat:${row.chatId}`,
          });
          n.onclick = () => {
            window.focus();
            const store = useDoctorChatUiStore.getState();
            if (!store.isOpen) store.open();
            store.openChat(row.chatId);
            n.close();
          };
        } catch {
          /* some browsers throw if called outside a gesture — ignore */
        }
      }
    },
  });

  return null;
}

/**
 * Mounted once at the app root. Fans out one WS subscription per chat
 * in the inbox so the user hears about messages even when the chat
 * dock is collapsed. Cost: one WebSocket per conversation. For the
 * expected chat count per user (single-digit to low tens), this is
 * fine; if it ever balloons we can consolidate behind a unified
 * backend channel.
 */
export function ChatNotifications() {
  const hydrated = useIsSessionHydrated();
  const isAuthenticated = useIsAuthenticated();
  const role = useAppRole();
  const hydratePrefs = useChatPrefsStore((s) => s.hydrate);

  // One-shot hydration of client-only state (prefs + drafts + lastRead
  // + panel width) on the first client render so stored values don't
  // flash defaults during the very first paint.
  useEffect(() => {
    hydratePrefs();
    hydrateChatUiFromStorage();
  }, [hydratePrefs]);

  const ready = hydrated && isAuthenticated && (role === "doctor" || role === "patient");

  const inboxQuery = useUnifiedInboxQuery(ready);
  const rows = inboxQuery.data ?? [];

  if (!ready) return null;

  return (
    <>
      {rows.map((row) => (
        <ChatRoomNotifier key={row.chatId} row={row} />
      ))}
    </>
  );
}
