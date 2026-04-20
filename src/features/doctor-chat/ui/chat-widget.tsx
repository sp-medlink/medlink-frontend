"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { GripVertical, X } from "lucide-react";
import Link from "next/link";

import {
  useAppRole,
  useIsAuthenticated,
  useIsSessionHydrated,
} from "@/entities/session";
import { ApiError } from "@/shared/api";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

import {
  hydrateChatUiFromStorage,
  useDoctorChatUiStore,
} from "../model/chat-ui-store";
import {
  useChatMessagesQuery,
  useUnifiedInboxQuery,
} from "../model/use-doctor-chat-queries";
import { useChatUnread } from "../model/use-unread";

import { Chat } from "./chat";
import { ChatConversation } from "./chat-conversation";
import { ChatFab } from "./chat-fab";
import { ChatInboxList } from "./chat-inbox-list";
import { buildChatMotionPresets } from "./chat-motion-presets";

export type ChatWidgetVariant = "dock" | "page";

interface ChatWidgetProps {
  variant?: ChatWidgetVariant;
}

/**
 * Chat orchestrator. Two surfaces:
 *
 *   - `dock` (default) — fixed panel on the right edge, animated
 *     on/off screen, resizable, with a FAB when collapsed.
 *   - `page` — fills its parent container (used on /patient/chats
 *     and /doctor/chats full-page routes).
 *
 * Both surfaces wrap the same `Chat` compound with either
 * {@link ChatInboxList} (no chat selected) or {@link ChatConversation}
 * (a chat selected). Patient vs. doctor behaviour is derived from the
 * current app role — not a separate widget.
 */
export function ChatWidget({ variant = "dock" }: ChatWidgetProps) {
  const isOpen = useDoctorChatUiStore((s) => s.isOpen);
  const view = useDoctorChatUiStore((s) => s.view);
  const selectedChatId = useDoctorChatUiStore((s) => s.selectedChatId);
  const open = useDoctorChatUiStore((s) => s.open);
  const close = useDoctorChatUiStore((s) => s.close);
  const showChatList = useDoctorChatUiStore((s) => s.showChatList);
  const openChat = useDoctorChatUiStore((s) => s.openChat);
  const panelWidthPx = useDoctorChatUiStore((s) => s.panelWidthPx);
  const setPanelWidthPx = useDoctorChatUiStore((s) => s.setPanelWidthPx);

  const hydrated = useIsSessionHydrated();
  const isAuthenticated = useIsAuthenticated();
  const appRole = useAppRole();
  const chatRole: "patient" | "doctor" | null =
    appRole === "doctor" || appRole === "patient" ? appRole : null;

  const isPage = variant === "page";
  const surfaceOpen = isPage || isOpen;

  const inboxQuery = useUnifiedInboxQuery(
    Boolean(surfaceOpen && hydrated && isAuthenticated && chatRole),
  );
  const inboxRows = useMemo(
    () => inboxQuery.data ?? [],
    [inboxQuery.data],
  );
  const unread = useChatUnread(inboxRows);

  const selectedConversation = useMemo(
    () => inboxRows.find((c) => c.chatId === selectedChatId) ?? null,
    [inboxRows, selectedChatId],
  );

  // Prefetch messages for the currently-selected chat even while the
  // inbox list is showing — lets the open-chat transition feel instant.
  useChatMessagesQuery(selectedChatId, Boolean(surfaceOpen && selectedChatId));

  /* --- escape-to-close (dock only) ----------------------------- */
  useEffect(() => {
    if (!isOpen || isPage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isPage, close]);

  /* --- hydrate panel width + drafts + last-read on client -------- */
  useLayoutEffect(() => {
    hydrateChatUiFromStorage();
  }, []);

  // Re-clamp panel width when the viewport shrinks so the panel never
  // ends up wider than the screen.
  useEffect(() => {
    const onWinResize = () => {
      const { panelWidthPx: w, setPanelWidthPx: setW } =
        useDoctorChatUiStore.getState();
      setW(w);
    };
    window.addEventListener("resize", onWinResize);
    return () => window.removeEventListener("resize", onWinResize);
  }, []);

  /* --- resize drag (dock only) --------------------------------- */
  const panelResizeDragRef = useRef<{ startX: number; startW: number } | null>(
    null,
  );
  const onResizeDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      panelResizeDragRef.current = { startX: e.clientX, startW: panelWidthPx };
    },
    [panelWidthPx],
  );
  const onResizeMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = panelResizeDragRef.current;
      if (!drag) return;
      const delta = drag.startX - e.clientX;
      setPanelWidthPx(drag.startW + delta);
    },
    [setPanelWidthPx],
  );
  const onResizeUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      panelResizeDragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    },
    [],
  );

  /* --- inbox list error message -------------------------------- */
  const inboxErrorMessage = useMemo(() => {
    if (!inboxQuery.isError) return "";
    const err = inboxQuery.error;
    if (err instanceof ApiError) return err.reason ?? err.message;
    if (err instanceof Error) return err.message;
    return "Could not load conversations.";
  }, [inboxQuery.isError, inboxQuery.error]);

  /* --- framer presets ------------------------------------------ */
  const reduceMotion = useReducedMotion();
  const presets = useMemo(
    () => buildChatMotionPresets(reduceMotion),
    [reduceMotion],
  );

  /* --- portal mount gate (dock-only, declared up-here so hook
         order stays constant across dock/page variants) ---------- */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* --- render body (shared between dock + page) ---------------- */
  function renderBody() {
    const showList = view !== "chat" || !selectedChatId;
    return (
      <>
        {showList ? (
          <>
            <Chat.Header className="justify-between pt-[max(1rem,env(safe-area-inset-top))] pb-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-neutral-100">
                  Conversations
                </p>
                <p className="text-xs text-neutral-500">
                  {isAuthenticated
                    ? `${inboxRows.length} ${inboxRows.length === 1 ? "conversation" : "conversations"} · Messages on server`
                    : "Sign in to send messages"}
                </p>
                {isAuthenticated &&
                chatRole === "patient" &&
                inboxRows.length > 0 ? (
                  <Link
                    href={routes.patient.organisations}
                    className="mt-1 inline-block text-xs font-medium text-emerald-400/90 underline-offset-2 hover:underline"
                    onClick={close}
                  >
                    Organizations
                  </Link>
                ) : null}
              </div>
              {!isPage ? (
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-400/40 focus-visible:outline-none"
                  aria-label="Close"
                >
                  <X className="size-4" aria-hidden />
                </button>
              ) : null}
            </Chat.Header>
            <ChatInboxList
              rows={inboxRows}
              unread={unread}
              hydrated={hydrated}
              isAuthenticated={isAuthenticated}
              chatRole={chatRole}
              loading={Boolean(
                hydrated &&
                  isAuthenticated &&
                  inboxQuery.isPending &&
                  inboxQuery.data === undefined,
              )}
              isError={inboxQuery.isError}
              errorMessage={inboxErrorMessage}
              emptyState={
                !inboxQuery.isPending &&
                !inboxQuery.isError &&
                inboxRows.length === 0
              }
              surfaceOpen={surfaceOpen}
              onOpenChat={openChat}
              onDismiss={close}
              listItemVariants={presets.listItem}
              listContainerVariants={presets.listContainer}
            />
          </>
        ) : (
          <ChatConversation
            chatId={selectedChatId!}
            conversation={selectedConversation}
            isPage={isPage}
            chatRole={chatRole}
            listItemVariants={presets.listItem}
            onBack={showChatList}
            onClose={close}
            onDeleted={showChatList}
          />
        )}
      </>
    );
  }

  /* --- page surface -------------------------------------------- */
  if (isPage) {
    if (!chatRole) {
      return (
        <div className="flex min-h-screen w-full flex-1 flex-col items-center justify-center bg-neutral-950 p-6 text-sm text-neutral-400">
          Chats are available as a patient or as a doctor.
        </div>
      );
    }
    return (
      <Chat
        role="region"
        aria-label="Chats"
        className="min-h-0 w-full flex-1"
      >
        {renderBody()}
      </Chat>
    );
  }

  /* --- dock surface -------------------------------------------- */
  const ui = (
    <>
      <AnimatePresence mode="sync">
        {!isOpen && chatRole ? (
          <ChatFab
            unreadCount={unread.total}
            onOpen={open}
            variants={presets.fabVariants}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {isOpen && chatRole ? (
          <motion.section
            key="chat-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Chats"
            variants={presets.panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed inset-y-0 right-0 z-110 flex h-dvh min-h-0 max-w-[100vw] flex-col overflow-hidden border-l",
              "border-neutral-800 bg-neutral-950 text-neutral-100 backdrop-blur-xl",
            )}
            style={{
              width: panelWidthPx,
              transformOrigin: "100% 50%",
              willChange: "transform, opacity",
            }}
          >
            {/* drag handle — only makes sense on the dock */}
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize chat panel"
              onPointerDown={onResizeDown}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeUp}
              onPointerCancel={onResizeUp}
              className="absolute top-0 bottom-0 left-0 z-10 flex w-4 -translate-x-1/2 cursor-ew-resize touch-none items-center justify-center select-none hover:bg-emerald-500/10 active:bg-emerald-500/20"
            >
              <span
                className="pointer-events-none flex items-center justify-center rounded-full border border-neutral-600/90 bg-neutral-900/95 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.35)] ring-1 ring-white/5"
                aria-hidden
              >
                <GripVertical
                  className="size-5 text-neutral-400"
                  strokeWidth={2}
                />
              </span>
            </div>

            <Chat className="h-full">{renderBody()}</Chat>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(ui, document.body);
}
