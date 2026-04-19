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
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import {
  ArrowUp,
  ChevronLeft,
  GripVertical,
  Loader2,
  MessageCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { toast } from "sonner";

import { fetchChatMessages } from "../api/chat-api";
import { doctorChatKeys } from "../api/query-keys";
import type { ChatLine } from "../model/chat-ui-store";
import { useChatRoomWebSocket } from "../model/use-chat-websocket";
import {
  hydrateChatPanelWidthFromStorage,
  useDoctorChatUiStore,
} from "../model/chat-ui-store";
import {
  CHAT_MESSAGES_STALE_MS,
  useChatMessagesQuery,
  useDeleteChatMutation,
  useSendChatMessageMutation,
  useUnifiedInboxQuery,
} from "../model/use-doctor-chat-queries";

import {
  useAppRole,
  useCurrentUser,
  useIsAuthenticated,
  useIsSessionHydrated,
} from "@/entities/session";
import { ApiError } from "@/shared/api";
import { env, routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

import { PatientChatStartWizard } from "./patient-chat-start-wizard";

/** Min / max height (px) — single line centered with send; then grows. */
const CHAT_INPUT_MIN_H = 40;
const CHAT_INPUT_MAX_H = 220;

/** Slide-only: panel and FAB move on/off screen — no opacity fade. */
function buildMotionPresets(reduceMotion: boolean | null) {
  const panelSpring: Transition = reduceMotion
    ? { duration: 0.32, ease: [0.32, 0.72, 0, 1] }
    : {
        type: "spring",
        stiffness: 220,
        damping: 42,
        mass: 1,
        restDelta: 0.01,
        restSpeed: 0.01,
      };

  const panelExit: Transition = reduceMotion
    ? { duration: 0.28, ease: [0.4, 0, 0.2, 1] }
    : {
        type: "spring",
        stiffness: 280,
        damping: 44,
        mass: 0.95,
      };

  const fabSlide: Transition = reduceMotion
    ? { duration: 0.28, ease: [0.32, 0.72, 0, 1] }
    : {
        type: "spring",
        stiffness: 340,
        damping: 32,
        mass: 0.8,
      };

  const panelVariants: Variants = reduceMotion
    ? {
        hidden: { x: "100%", opacity: 1 },
        visible: { x: 0, opacity: 1, transition: panelSpring },
        exit: { x: "100%", opacity: 1, transition: panelExit },
      }
    : {
        hidden: {
          x: "100%",
          opacity: 1,
        },
        visible: {
          x: 0,
          opacity: 1,
          transition: { x: panelSpring },
        },
        exit: {
          x: "100%",
          opacity: 1,
          transition: { x: panelExit },
        },
      };

  const fabVariants: Variants = reduceMotion
    ? {
        hidden: { y: 56, opacity: 1 },
        visible: { y: 0, opacity: 1, transition: fabSlide },
        exit: { y: 56, opacity: 1, transition: { duration: 0.22 } },
      }
    : {
        hidden: {
          y: 72,
          opacity: 1,
        },
        visible: {
          y: 0,
          opacity: 1,
          transition: fabSlide,
        },
        exit: {
          y: 72,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 380,
            damping: 36,
          },
        },
      };

  const listContainer: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { staggerChildren: 0 }
        : { staggerChildren: 0.04, delayChildren: 0.08 },
    },
  };

  const listItem: Variants = reduceMotion
    ? { hidden: { x: 12, opacity: 1 }, visible: { x: 0, opacity: 1 } }
    : {
        hidden: { x: 20, opacity: 1 },
        visible: {
          x: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 38,
            mass: 0.85,
          },
        },
      };

  return {
    panelVariants,
    fabVariants,
    listContainer,
    listItem,
  };
}

function resolveAvatarUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${env.apiBaseUrl}${p}`;
  return p;
}

function initials(name: string): string {
  const parts = name.replace(/^Dr\.\s*/i, "").trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function startOfLocalDay(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Thread separator: "Today", "Yesterday", or a localized date (e.g. "April 8"). */
function formatChatDateLabel(ts: number, nowMs: number): string {
  const dayStart = startOfLocalDay(ts);
  const todayStart = startOfLocalDay(nowMs);
  if (dayStart === todayStart) return "Today";
  if (dayStart === todayStart - 86400000) return "Yesterday";
  const msgYear = new Date(ts).getFullYear();
  const currentYear = new Date(nowMs).getFullYear();
  return new Date(ts).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    ...(msgYear !== currentYear ? { year: "numeric" as const } : {}),
  });
}

function formatMessageTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatInboxTime(tsIso: string): string {
  const ts = new Date(tsIso).getTime();
  if (!Number.isFinite(ts)) return "";

  const now = Date.now();
  const dayStart = startOfLocalDay(ts);
  const todayStart = startOfLocalDay(now);
  if (dayStart === todayStart) {
    return formatMessageTime(ts);
  }
  if (dayStart === todayStart - 86400000) {
    return "Yesterday";
  }
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatMyChatsError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.reason ?? err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Could not load conversations.";
}

function NoChatsDoctorCard() {
  return (
    <li className="flex flex-col items-center gap-3 px-3 py-10 text-center">
      <p className="text-sm font-medium text-neutral-200">No chats</p>
      <p className="max-w-[16rem] text-xs leading-relaxed text-neutral-500">
        When patients message you, conversations will appear here.
      </p>
    </li>
  );
}

function ChatDateSeparator({ ts }: { ts: number }) {
  const label = formatChatDateLabel(ts, Date.now());
  return (
    <div className="flex justify-center py-2">
      <span className="rounded-full bg-neutral-800/90 px-3 py-1 text-[11px] font-medium text-neutral-400">
        {label}
      </span>
    </div>
  );
}

function ChatMessageBubble({ m }: { m: ChatLine }) {
  const timeStr = formatMessageTime(m.createdAt);
  const iso = new Date(m.createdAt).toISOString();
  return (
    <div
      className={cn(
        "flex w-full",
        m.role === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "wrap-anywhere flex min-w-0 max-w-[92%] w-fit flex-col gap-1 rounded-2xl px-4 py-2 text-left text-[13px] leading-snug whitespace-pre-wrap",
          m.role === "user"
            ? "bg-neutral-800 text-neutral-100"
            : "bg-neutral-900 text-neutral-100 ring-1 ring-neutral-800",
        )}
      >
        <span className="min-w-0">{m.body}</span>
        <div className="flex shrink-0 justify-end">
          <time
            dateTime={iso}
            className={cn(
              "text-[11px] leading-none tabular-nums tracking-tight select-none",
              m.role === "user" ? "text-neutral-400" : "text-neutral-500",
            )}
          >
            {timeStr}
          </time>
        </div>
      </div>
    </div>
  );
}

function DoctorAvatar({
  name,
  avatarUrl,
  sizeClass = "size-11",
}: {
  name: string;
  avatarUrl?: string | null;
  sizeClass?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(avatarUrl) && !failed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700/90 shadow-[0_1px_6px_rgba(0,0,0,0.35)]",
        sizeClass,
      )}
    >
      {showPhoto ? (
        // External demo URLs; dynamic per doctor — next/image would need remotePatterns for each host.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl!}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-[0.7rem] font-semibold tracking-tight text-neutral-200">
          {initials(name)}
        </span>
      )}
    </span>
  );
}

export type DoctorChatWidgetVariant = "dock" | "page";

export function DoctorChatWidget({
  variant = "dock",
}: {
  variant?: DoctorChatWidgetVariant;
} = {}) {
  const isOpen = useDoctorChatUiStore((s) => s.isOpen);
  const view = useDoctorChatUiStore((s) => s.view);
  const selectedChatId = useDoctorChatUiStore((s) => s.selectedChatId);
  const open = useDoctorChatUiStore((s) => s.open);
  const close = useDoctorChatUiStore((s) => s.close);
  const showChatList = useDoctorChatUiStore((s) => s.showChatList);
  const openChat = useDoctorChatUiStore((s) => s.openChat);
  const panelWidthPx = useDoctorChatUiStore((s) => s.panelWidthPx);
  const setPanelWidthPx = useDoctorChatUiStore((s) => s.setPanelWidthPx);

  const queryClient = useQueryClient();
  const hydrated = useIsSessionHydrated();
  const isAuthenticated = useIsAuthenticated();
  const currentUser = useCurrentUser();
  const appRole = useAppRole();
  const chatRole =
    appRole === "doctor" || appRole === "patient" ? appRole : null;

  const isPage = variant === "page";
  const surfaceOpen = isPage || isOpen;

  const inboxQuery = useUnifiedInboxQuery(
    Boolean(surfaceOpen && hydrated && isAuthenticated && chatRole),
  );

  const inboxRows = useMemo(() => inboxQuery.data ?? [], [inboxQuery.data]);

  const inboxListLoading =
    hydrated &&
    isAuthenticated &&
    inboxQuery.isPending &&
    inboxQuery.data === undefined;

  const showNoChatsCard =
    !inboxQuery.isPending &&
    !inboxQuery.isError &&
    inboxRows.length === 0;

  const selectedConversation = useMemo(
    () => inboxRows.find((c) => c.chatId === selectedChatId) ?? null,
    [inboxRows, selectedChatId],
  );

  const chatId = selectedChatId;

  const messagesQuery = useChatMessagesQuery(
    chatId,
    Boolean(surfaceOpen && view === "chat" && chatId),
  );

  useChatRoomWebSocket(
    chatId,
    Boolean(
      surfaceOpen && view === "chat" && chatId && hydrated && isAuthenticated,
    ),
  );

  const sendMutation = useSendChatMessageMutation(chatId);
  const deleteChatMutation = useDeleteChatMutation();

  const [draft, setDraft] = useState("");
  const [inboxSearch, setInboxSearch] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const panelResizeDragRef = useRef<{ startX: number; startW: number } | null>(
    null,
  );

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

  const lines: ChatLine[] = useMemo(() => {
    if (!messagesQuery.data?.messages || !currentUser?.id) return [];
    const sorted = [...messagesQuery.data.messages].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return sorted.map((m) => ({
      id: m.id,
      role: m.sender_user_id === currentUser.id ? "user" : "doctor",
      body: m.text_content,
      createdAt: new Date(m.created_at).getTime(),
    }));
  }, [messagesQuery.data, currentUser?.id]);

  useEffect(() => {
    if (!isOpen || isPage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isPage, close]);

  useEffect(() => {
    if (!surfaceOpen || view !== "chat") return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [surfaceOpen, view, lines.length]);

  useLayoutEffect(() => {
    if (!surfaceOpen || view !== "chat") return;
    adjustTextareaHeight();
  }, [draft, surfaceOpen, view, adjustTextareaHeight]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || !chatId) return;
    try {
      await sendMutation.mutateAsync(text);
      setDraft("");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Could not send message. Try again.";
      toast.error(msg);
    }
  }, [chatId, draft, sendMutation]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    hydrateChatPanelWidthFromStorage();
  }, []);

  useEffect(() => {
    const onWinResize = () => {
      const { panelWidthPx: w, setPanelWidthPx: setW } =
        useDoctorChatUiStore.getState();
      setW(w);
    };
    window.addEventListener("resize", onWinResize);
    return () => window.removeEventListener("resize", onWinResize);
  }, []);

  const onPanelResizePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      panelResizeDragRef.current = {
        startX: e.clientX,
        startW: panelWidthPx,
      };
    },
    [panelWidthPx],
  );

  const onPanelResizePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = panelResizeDragRef.current;
      if (!drag) return;
      const delta = drag.startX - e.clientX;
      setPanelWidthPx(drag.startW + delta);
    },
    [setPanelWidthPx],
  );

  const onPanelResizePointerUp = useCallback(
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

  const reduceMotion = useReducedMotion();
  const presets = buildMotionPresets(reduceMotion);

  const filteredInboxRows = useMemo(() => {
    const q = inboxSearch.trim().toLowerCase();
    if (!q) return inboxRows;
    return inboxRows.filter((row) =>
      row.peerDisplayName.toLowerCase().includes(q),
    );
  }, [inboxRows, inboxSearch]);

  const onDeleteChat = useCallback(async () => {
    if (!selectedConversation || !chatId) return;
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
        doctorDepartmentId: selectedConversation.doctorDepartmentId,
      });
      showChatList();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Could not delete chat.";
      toast.error(msg);
    }
  }, [
    chatId,
    deleteChatMutation,
    selectedConversation,
    showChatList,
  ]);

  function renderChatPanelBody() {
    return (
      <>
              {!isPage ? (
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize chat panel"
                  onPointerDown={onPanelResizePointerDown}
                  onPointerMove={onPanelResizePointerMove}
                  onPointerUp={onPanelResizePointerUp}
                  onPointerCancel={onPanelResizePointerUp}
                  className="absolute top-0 bottom-0 left-0 z-10 flex w-4 -translate-x-1/2 cursor-ew-resize touch-none select-none items-center justify-center hover:bg-emerald-500/10 active:bg-emerald-500/20"
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
              ) : null}
            {view === "list" ? (
              <>
                <header className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-950 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
                  <div className="min-w-0">
                    <p className="text-base font-semibold tracking-tight text-neutral-100">
                      Conversations
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {isAuthenticated
                        ? `${inboxRows.length} ${inboxRows.length === 1 ? "conversation" : "conversations"} · Messages on server`
                        : "Sign in to send messages"}
                    </p>
                    {isAuthenticated &&
                    !(showNoChatsCard && chatRole === "patient") ? (
                      <Link
                        href={routes.patient.organisations}
                        className="mt-1.5 inline-block text-xs font-medium text-emerald-400/90 underline-offset-2 hover:text-emerald-300 hover:underline"
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
                </header>

                {isAuthenticated && inboxRows.length > 0 ? (
                  <div className="shrink-0 border-b border-neutral-800 bg-neutral-950 px-3 py-2.5">
                    <label htmlFor="chat-inbox-search" className="sr-only">
                      Search conversations
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-neutral-800/90 bg-neutral-900/70 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-emerald-500/15">
                      <Search
                        className="size-4 shrink-0 text-neutral-500"
                        aria-hidden
                      />
                      <input
                        id="chat-inbox-search"
                        type="text"
                        value={inboxSearch}
                        onChange={(e) => setInboxSearch(e.target.value)}
                        placeholder={
                          chatRole === "doctor"
                            ? "Search patients"
                            : "Search doctors"
                        }
                        className="min-w-0 flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : null}

                <motion.ul
                  className="scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden bg-neutral-950 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                  variants={presets.listContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {!hydrated ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                          aria-hidden
                        >
                          <div className="size-11 shrink-0 animate-pulse rounded-full bg-neutral-800" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-4 w-[58%] max-w-56 animate-pulse rounded bg-neutral-800" />
                            <div className="h-3 w-[36%] max-w-36 animate-pulse rounded bg-neutral-800" />
                          </div>
                        </li>
                      ))}
                    </>
                  ) : !isAuthenticated ? (
                    <li className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-4 text-center text-sm text-neutral-400">
                      <Link
                        href={routes.login}
                        className="font-medium text-emerald-400 underline-offset-2 hover:underline"
                        onClick={close}
                      >
                        Sign in
                      </Link>{" "}
                      to open chats with doctors.
                    </li>
                  ) : inboxListLoading ? (
                    <li className="flex justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-neutral-400" aria-hidden />
                    </li>
                  ) : inboxQuery.isError ? (
                    <li className="rounded-xl border border-red-900/50 bg-red-950/20 px-3 py-3 text-sm text-red-200/90">
                      {formatMyChatsError(inboxQuery.error)}
                    </li>
                  ) : showNoChatsCard ? (
                    chatRole === "patient" ? (
                      <PatientChatStartWizard chatSurfaceActive={surfaceOpen} />
                    ) : (
                      <NoChatsDoctorCard />
                    )
                  ) : filteredInboxRows.length === 0 ? (
                    <li className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-4 text-center text-sm text-neutral-400">
                      No conversations match your search.
                    </li>
                  ) : (
                    filteredInboxRows.map((c) => {
                      const name = c.peerDisplayName;
                      const avatarUrl = resolveAvatarUrl(c.peerAvatarPath);
                      const lastLabel = formatInboxTime(c.lastMessageCreatedAt);
                      return (
                        <motion.li key={c.chatId} variants={presets.listItem}>
                          <button
                            type="button"
                            onClick={() => {
                              void queryClient.prefetchQuery({
                                queryKey: doctorChatKeys.messages(c.chatId),
                                queryFn: () => fetchChatMessages(c.chatId),
                                staleTime: CHAT_MESSAGES_STALE_MS,
                              });
                              openChat(c.chatId);
                            }}
                            className={cn(
                              "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:outline-none",
                              selectedChatId === c.chatId
                                ? "border-emerald-500/40 bg-emerald-500/10"
                                : "border-transparent bg-neutral-900/55 hover:border-neutral-700 hover:bg-neutral-800/80",
                            )}
                          >
                            <DoctorAvatar
                              name={name}
                              avatarUrl={avatarUrl}
                              sizeClass="size-11"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-neutral-100">
                                {name}
                              </span>
                              <span className="block truncate text-xs text-neutral-500">
                                {c.kind === "doctor"
                                  ? "Patient conversation"
                                  : "Doctor conversation"}
                              </span>
                            </span>
                            <span className="shrink-0 rounded-full border border-neutral-700/70 bg-neutral-800/80 px-2 py-0.5 text-[11px] text-neutral-400 transition group-hover:border-neutral-600 group-hover:text-neutral-300">
                              {lastLabel}
                            </span>
                          </button>
                        </motion.li>
                      );
                    })
                  )}
                </motion.ul>
              </>
            ) : (
              <>
                <header className="flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:px-3">
                  <button
                    type="button"
                    onClick={showChatList}
                    className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-400/35 focus-visible:outline-none"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="size-5" aria-hidden />
                  </button>
                  {selectedConversation ? (
                    <DoctorAvatar
                      name={selectedConversation.peerDisplayName}
                      avatarUrl={resolveAvatarUrl(
                        selectedConversation.peerAvatarPath,
                      )}
                      sizeClass="size-9"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-100">
                      {selectedConversation
                        ? selectedConversation.peerDisplayName
                        : chatRole === "doctor"
                          ? "Patient"
                          : "Doctor"}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {selectedConversation
                        ? formatDistanceToNow(
                            new Date(
                              selectedConversation.lastMessageCreatedAt,
                            ),
                            { addSuffix: true, locale: enUS },
                          )
                        : ""}
                    </p>
                  </div>
                  {selectedConversation ? (
                    <button
                      type="button"
                      onClick={() => void onDeleteChat()}
                      disabled={deleteChatMutation.isPending}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-950/40 hover:text-red-200 focus-visible:ring-2 focus-visible:ring-red-400/35 focus-visible:outline-none disabled:opacity-40"
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
                      onClick={close}
                      className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-400/35 focus-visible:outline-none"
                      aria-label="Close"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  ) : null}
                </header>

                <div
                  ref={listRef}
                  className="scrollbar-none min-h-0 flex-1 space-y-3 overflow-y-auto bg-neutral-950 px-3 py-3"
                >
                  {messagesQuery.isPending &&
                  messagesQuery.data === undefined ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="size-7 animate-spin text-neutral-500" aria-hidden />
                    </div>
                  ) : messagesQuery.isError ? (
                    <p className="text-sm text-red-300/90">
                      Could not load messages.
                    </p>
                  ) : lines.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      No messages yet — say hello. Your conversation is stored securely.
                    </p>
                  ) : (
                    lines.map((m, i) => {
                      const prev = i > 0 ? lines[i - 1] : undefined;
                      const showDate =
                        !prev ||
                        startOfLocalDay(m.createdAt) !==
                          startOfLocalDay(prev.createdAt);
                      return (
                        <Fragment key={m.id}>
                          {showDate ? <ChatDateSeparator ts={m.createdAt} /> : null}
                          <ChatMessageBubble m={m} />
                        </Fragment>
                      );
                    })
                  )}
                </div>

                <footer className="shrink-0 border-t border-neutral-800 bg-neutral-950 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
                  <label className="sr-only" htmlFor="doctor-chat-input">
                    Message
                  </label>
                  <div className="flex min-h-0 items-end gap-2 rounded-2xl border border-neutral-700/80 bg-neutral-900/95 py-1.5 pl-3 pr-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                    <textarea
                      ref={textareaRef}
                      id="doctor-chat-input"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Message"
                      rows={1}
                      disabled={!chatId || sendMutation.isPending}
                      className="scrollbar-none min-h-0 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-left text-[15px] leading-5 text-neutral-100 placeholder:text-neutral-500 focus:outline-none disabled:opacity-50"
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
                      disabled={
                        !draft.trim() || !chatId || sendMutation.isPending
                      }
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:outline-none"
                      aria-label="Send message"
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <ArrowUp className="size-4" aria-hidden />
                      )}
                    </button>
                  </div>
                  <p className="px-1 pt-1 text-[11px] text-neutral-500">
                    Press Enter to send, Shift+Enter for a new line.
                  </p>
                </footer>
              </>
            )}
      </>
    );
  }

  const ui = (
    <>
      <AnimatePresence mode="sync">
        {!isOpen && chatRole && !isPage ? (
          <motion.button
            key="doctor-chat-fab"
            type="button"
            onClick={open}
            variants={presets.fabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed right-6 bottom-6 z-120 inline-flex origin-bottom-right items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium text-neutral-100 shadow-2xl backdrop-blur-md hover:brightness-110 focus-visible:ring-2 focus-visible:ring-emerald-400/30 focus-visible:outline-none",
              "border-neutral-700 bg-neutral-950/95 ring-1 ring-neutral-600/50",
            )}
            aria-expanded={false}
            aria-haspopup="dialog"
            style={{ willChange: "transform, opacity" }}
          >
            <MessageCircle
              className="size-5 shrink-0 text-emerald-400/90"
              strokeWidth={2}
              aria-hidden
            />
            Chat
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {isOpen && chatRole && !isPage ? (
          <>
            <motion.section
              key="doctor-chat-panel"
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
              {renderChatPanelBody()}
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );

  if (isPage) {
    if (!chatRole) {
      return (
        <div className="flex min-h-screen w-full flex-1 flex-col items-center justify-center bg-neutral-950 p-6 text-sm text-neutral-400">
          Chats are available as a patient or as a doctor.
        </div>
      );
    }
    return (
      <section
        role="region"
        aria-label="Chats"
        className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-neutral-950 text-neutral-100"
      >
        {renderChatPanelBody()}
      </section>
    );
  }

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(ui, document.body);
}
