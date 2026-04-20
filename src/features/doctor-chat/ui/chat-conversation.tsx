"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, type Variants } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  ArrowUp,
  ChevronLeft,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useCurrentUser } from "@/entities/session";
import { ApiError } from "@/shared/api";
import { cn } from "@/shared/lib/utils";

import type { UnifiedInboxRow } from "../api/types";
import {
  useChatRoomWebSocket,
} from "../model/use-chat-websocket";
import { useDoctorChatUiStore, type ChatLine } from "../model/chat-ui-store";
import {
  useChatMessagesQuery,
  useDeleteChatMutation,
  useDiscardPendingMessage,
  usePendingMessagesMeta,
  useSendChatMessageMutation,
} from "../model/use-doctor-chat-queries";

import { Chat } from "./chat";
import {
  ChatAvatar,
  ChatMessageBubble,
  formatChatDateLabel,
  resolveAvatarUrl,
  startOfLocalDay,
} from "./chat-message-bubble";
import { ChatPrefsToggle } from "./chat-prefs-toggle";
import { PeerInfoPopover } from "./peer-info-popover";

const CHAT_INPUT_MIN_H = 40;
const CHAT_INPUT_MAX_H = 220;

interface ChatConversationProps {
  chatId: string;
  conversation: UnifiedInboxRow | null;
  isPage: boolean;
  chatRole: "patient" | "doctor" | null;
  listItemVariants: Variants;
  onBack: () => void;
  onClose: () => void;
  onDeleted: () => void;
}

/**
 * One conversation: header, messages, composer. Owns the message
 * query, the WS subscription, optimistic send state, scroll tracking,
 * and draft persistence — everything specific to a single chat.
 */
export function ChatConversation({
  chatId,
  conversation,
  isPage,
  chatRole,
  listItemVariants,
  onBack,
  onClose,
  onDeleted,
}: ChatConversationProps) {
  const currentUser = useCurrentUser();
  const markChatRead = useDoctorChatUiStore((s) => s.markChatRead);
  const setDraftInStore = useDoctorChatUiStore((s) => s.setDraft);
  const clearDraftInStore = useDoctorChatUiStore((s) => s.clearDraft);
  const storedDraft = useDoctorChatUiStore((s) => s.drafts[chatId] ?? "");

  const messagesQuery = useChatMessagesQuery(chatId, true);
  useChatRoomWebSocket(chatId, true);

  const sendMutation = useSendChatMessageMutation(chatId);
  const deleteChatMutation = useDeleteChatMutation();
  const discardPending = useDiscardPendingMessage(chatId);
  const pendingMeta = usePendingMessagesMeta(chatId);

  /* --- draft ---------------------------------------------------- */
  const [draft, setDraft] = useState("");
  const hydratedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (hydratedForRef.current === chatId) return;
    hydratedForRef.current = chatId;
    setDraft(storedDraft);
  }, [chatId, storedDraft]);
  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (draft) setDraftInStore(chatId, draft);
      else clearDraftInStore(chatId);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [draft, chatId, setDraftInStore, clearDraftInStore]);

  /* --- messages mapped to UI lines ------------------------------ */
  const lines: ChatLine[] = useMemo(() => {
    if (!messagesQuery.data?.messages || !currentUser?.id) return [];
    const sorted = [...messagesQuery.data.messages].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return sorted.map((m) => {
      const meta = pendingMeta[m.id];
      return {
        id: m.id,
        role: m.sender_user_id === currentUser.id ? "user" : "doctor",
        body: m.text_content,
        createdAt: new Date(m.created_at).getTime(),
        pending: meta?.status,
        draftText: meta?.draft,
      };
    });
  }, [messagesQuery.data, currentUser?.id, pendingMeta]);

  /* --- scroll tracking + jump-to-latest ------------------------- */
  const listRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadInView, setUnreadInView] = useState(0);

  const scrollToBottom = useCallback((smooth: boolean) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    // 48px slack — "almost at bottom" counts as at-bottom so tiny
    // nudges don't leave the pill visible.
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    setIsAtBottom((prev) => {
      if (prev !== atBottom && atBottom) setUnreadInView(0);
      return atBottom;
    });
  }, []);

  // On new messages: stick to bottom if already there; otherwise
  // accumulate an "N new" counter for the jump-to-latest pill.
  const prevLineCountRef = useRef(0);
  useEffect(() => {
    const prev = prevLineCountRef.current;
    prevLineCountRef.current = lines.length;
    if (lines.length > prev && !isAtBottom) {
      const incoming = lines
        .slice(prev)
        .filter((l) => l.role !== "user").length;
      if (incoming > 0) setUnreadInView((n) => n + incoming);
      return;
    }
    scrollToBottom(true);
  }, [lines, isAtBottom, scrollToBottom]);

  // Mark-read: user sitting at the bottom of an open chat — stamp the
  // newest message as seen. Idempotent in the store.
  useEffect(() => {
    if (!isAtBottom) return;
    const latestIso = messagesQuery.data?.messages
      ?.map((m) => m.updated_at || m.created_at)
      .sort()
      .at(-1);
    if (latestIso) markChatRead(chatId, latestIso);
  }, [chatId, isAtBottom, messagesQuery.data, markChatRead]);

  /* --- composer ------------------------------------------------- */
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(
      CHAT_INPUT_MAX_H,
      Math.max(CHAT_INPUT_MIN_H, el.scrollHeight),
    );
    el.style.height = `${next}px`;
  }, []);
  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [draft, adjustTextareaHeight]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    clearDraftInStore(chatId);
    try {
      await sendMutation.mutateAsync({ text });
    } catch {
      // Inline failed-bubble UI handles the user feedback — no toast,
      // which avoids double-signalling the same problem.
    }
  }, [chatId, draft, clearDraftInStore, sendMutation]);

  const retry = useCallback(
    async (tempId: string, text: string) => {
      try {
        await sendMutation.mutateAsync({ text, retryOfPendingId: tempId });
      } catch {
        /* stays in failed state — bubble keeps retry controls visible */
      }
    },
    [sendMutation],
  );

  const onDelete = useCallback(async () => {
    if (!conversation) return;
    if (
      !window.confirm(
        "Delete this chat? The history will be removed for you.",
      )
    ) {
      return;
    }
    try {
      await deleteChatMutation.mutateAsync({
        chatId,
        doctorDepartmentId: conversation.doctorDepartmentId,
      });
      onDeleted();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not delete chat.",
      );
    }
  }, [chatId, conversation, deleteChatMutation, onDeleted]);

  /* --- render --------------------------------------------------- */
  return (
    <>
      <Chat.Header>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-emerald-400/35 focus-visible:outline-none"
          aria-label="Back to conversations"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>

        {conversation ? (
          <PeerInfoPopover row={conversation}>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-0.5 text-left transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-emerald-400/35 focus-visible:outline-none"
              aria-label={`${conversation.peerDisplayName} — details`}
            >
              <ChatAvatar
                name={conversation.peerDisplayName}
                avatarUrl={resolveAvatarUrl(conversation.peerAvatarPath)}
                sizeClass="size-9"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {conversation.peerDisplayName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {formatDistanceToNow(
                    new Date(conversation.lastMessageCreatedAt),
                    { addSuffix: true, locale: enUS },
                  )}
                </span>
              </span>
            </button>
          </PeerInfoPopover>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {chatRole === "doctor" ? "Patient" : "Doctor"}
            </p>
          </div>
        )}

        <ChatPrefsToggle />

        {conversation ? (
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={deleteChatMutation.isPending}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive/35 focus-visible:outline-none disabled:opacity-40"
            aria-label="Delete chat"
          >
            {deleteChatMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-4" aria-hidden />
            )}
          </button>
        ) : null}

        {!isPage ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-emerald-400/35 focus-visible:outline-none"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </Chat.Header>

      <Chat.Content
        ref={listRef}
        onScroll={onScroll}
        className="space-y-1"
        overlay={
          !isAtBottom ? (
            <Chat.JumpToLatest
              count={unreadInView}
              onClick={() => {
                setUnreadInView(0);
                scrollToBottom(true);
              }}
            />
          ) : undefined
        }
      >
        {messagesQuery.isPending && messagesQuery.data === undefined ? (
          <div className="flex justify-center py-10">
            <Loader2
              className="size-7 animate-spin text-muted-foreground"
              aria-hidden
            />
          </div>
        ) : messagesQuery.isError ? (
          <p className="text-sm text-destructive">Could not load messages.</p>
        ) : lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No messages yet — say hello. Your conversation is stored
            securely.
          </p>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0 } },
            }}
          >
            {lines.map((m, i) => {
              const prev = i > 0 ? lines[i - 1] : undefined;
              const showDate =
                !prev ||
                startOfLocalDay(m.createdAt) !==
                  startOfLocalDay(prev.createdAt);
              const grouped =
                !showDate &&
                prev?.role === m.role &&
                m.createdAt - prev.createdAt < 5 * 60_000;
              return (
                <Fragment key={m.id}>
                  {showDate ? (
                    <Chat.DateSeparator
                      label={formatChatDateLabel(m.createdAt, Date.now())}
                    />
                  ) : null}
                  <motion.div variants={listItemVariants}>
                    <ChatMessageBubble
                      m={m}
                      grouped={grouped}
                      onRetry={
                        m.pending === "failed" && m.draftText
                          ? () => void retry(m.id, m.draftText!)
                          : undefined
                      }
                      onDiscard={
                        m.pending === "failed"
                          ? () => discardPending(m.id)
                          : undefined
                      }
                    />
                  </motion.div>
                </Fragment>
              );
            })}
          </motion.div>
        )}
      </Chat.Content>

      <Chat.Footer>
        <label className="sr-only" htmlFor="chat-input">
          Message
        </label>
        <div className="flex min-h-0 items-end gap-2 rounded-2xl border bg-muted/40 py-1.5 pr-1.5 pl-3">
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message"
            rows={1}
            disabled={sendMutation.isPending}
            className="scrollbar-none min-h-0 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-left text-[15px] leading-5 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            style={{ height: CHAT_INPUT_MIN_H, maxHeight: CHAT_INPUT_MAX_H }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!draft.trim() || sendMutation.isPending}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition",
              "hover:bg-emerald-500",
              "disabled:cursor-not-allowed disabled:opacity-40",
              "focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:outline-none",
            )}
            aria-label="Send message"
          >
            {sendMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ArrowUp className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </Chat.Footer>
    </>
  );
}
