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
  MessageCircle,
  Stethoscope,
  X,
} from "lucide-react";

import type { ChatLine, DoctorOption } from "../model/chat-ui-store";
import {
  hydrateChatPanelWidthFromStorage,
  useDoctorChatUiStore,
} from "../model/chat-ui-store";

import { cn } from "@/shared/lib/utils";

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

/** Stable demo portraits (HTTPS); entries without `avatarUrl` use initials only. */
const DEMO_DOCTORS: DoctorOption[] = [
  {
    id: "d1",
    name: "Dr. Sarah Chen",
    specialty: "Cardiology",
    avatarUrl: "https://picsum.photos/seed/medlink-d1/128/128",
  },
  {
    id: "d2",
    name: "Dr. Marcus Webb",
    specialty: "Family medicine",
    avatarUrl: "https://picsum.photos/seed/medlink-d2/128/128",
  },
  {
    id: "d3",
    name: "Dr. Elena Petrov",
    specialty: "Dermatology",
    avatarUrl: "https://picsum.photos/seed/medlink-d3/128/128",
  },
  {
    id: "d4",
    name: "Dr. James Okonkwo",
    specialty: "Neurology",
    avatarUrl: "https://picsum.photos/seed/medlink-d4/128/128",
  },
  {
    id: "d5",
    name: "Dr. Priya Nair",
    specialty: "Endocrinology",
    avatarUrl: "https://picsum.photos/seed/medlink-d5/128/128",
  },
  {
    id: "d6",
    name: "Dr. Tomás Álvarez",
    specialty: "Orthopedics",
    avatarUrl: "https://picsum.photos/seed/medlink-d6/128/128",
  },
  { id: "d7", name: "Dr. Mei Lin", specialty: "Pediatrics" },
  { id: "d8", name: "Dr. Omar Haddad", specialty: "Psychiatry" },
  { id: "d9", name: "Dr. Ingrid Berg", specialty: "OB-GYN" },
  { id: "d10", name: "Dr. Kwame Boateng", specialty: "Gastroenterology" },
  { id: "d11", name: "Dr. Sofia Rossi", specialty: "Pulmonology" },
  { id: "d12", name: "Dr. Noah Fischer", specialty: "Ophthalmology" },
];

const DOCTOR_COUNT = DEMO_DOCTORS.length;

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

/** Разделитель в ленте: «Сегодня», «Вчера» или «8 апреля» (RU). */
function formatChatDateLabel(ts: number, nowMs: number): string {
  const dayStart = startOfLocalDay(ts);
  const todayStart = startOfLocalDay(nowMs);
  if (dayStart === todayStart) return "Сегодня";
  if (dayStart === todayStart - 86400000) return "Вчера";
  const msgYear = new Date(ts).getFullYear();
  const currentYear = new Date(nowMs).getFullYear();
  return new Date(ts).toLocaleDateString("ru-RU", {
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
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700/90",
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

export function DoctorChatWidget() {
  const isOpen = useDoctorChatUiStore((s) => s.isOpen);
  const view = useDoctorChatUiStore((s) => s.view);
  const selectedDoctorId = useDoctorChatUiStore((s) => s.selectedDoctorId);
  const threads = useDoctorChatUiStore((s) => s.threads);
  const open = useDoctorChatUiStore((s) => s.open);
  const close = useDoctorChatUiStore((s) => s.close);
  const showDoctorList = useDoctorChatUiStore((s) => s.showDoctorList);
  const pickDoctor = useDoctorChatUiStore((s) => s.pickDoctor);
  const appendMessage = useDoctorChatUiStore((s) => s.appendMessage);
  const panelWidthPx = useDoctorChatUiStore((s) => s.panelWidthPx);
  const setPanelWidthPx = useDoctorChatUiStore((s) => s.setPanelWidthPx);

  const [draft, setDraft] = useState("");
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

  const selectedDoctor = useMemo(
    () => DEMO_DOCTORS.find((d) => d.id === selectedDoctorId) ?? null,
    [selectedDoctorId],
  );

  const lines = selectedDoctorId ? (threads[selectedDoctorId] ?? []) : [];

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || view !== "chat") return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [isOpen, view, lines.length]);

  useLayoutEffect(() => {
    if (!isOpen || view !== "chat") return;
    adjustTextareaHeight();
  }, [draft, isOpen, view, adjustTextareaHeight]);

  const send = useCallback(() => {
    const id = selectedDoctorId;
    if (!id) return;
    const text = draft.trim();
    if (!text) return;
    appendMessage(id, "user", text);
    setDraft("");
    window.setTimeout(() => {
      appendMessage(
        id,
        "doctor",
        "Thanks for the message — I’ll follow up shortly with next steps.",
      );
    }, 450);
  }, [appendMessage, draft, selectedDoctorId]);

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

  const ui = (
    <>
      <AnimatePresence mode="sync">
        {!isOpen ? (
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
            chat
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {isOpen ? (
          <>
            <motion.section
              key="doctor-chat-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Doctor chat"
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
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Изменить ширину чата"
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
            {view === "list" ? (
              <>
                <header className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-950 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight text-neutral-100">Your doctors</p>
                    <p className="text-xs text-neutral-500">
                      {DOCTOR_COUNT} {DOCTOR_COUNT === 1 ? "doctor" : "doctors"} · Pick someone to message
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-400/40 focus-visible:outline-none"
                    aria-label="Close"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </header>

                <motion.ul
                  className="scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden bg-neutral-950 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                  variants={presets.listContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {DEMO_DOCTORS.map((doc) => (
                    <motion.li key={doc.id} variants={presets.listItem}>
                      <button
                        type="button"
                        onClick={() => pickDoctor(doc.id)}
                        className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-neutral-900/50 px-3 py-2.5 text-left transition hover:border-neutral-700 hover:bg-neutral-800/80 focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:outline-none"
                      >
                        <DoctorAvatar name={doc.name} avatarUrl={doc.avatarUrl} sizeClass="size-11" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-neutral-100">{doc.name}</span>
                          <span className="flex items-center gap-1 truncate text-xs text-neutral-500">
                            <Stethoscope className="size-3.5 shrink-0 text-neutral-600" aria-hidden />
                            {doc.specialty}
                          </span>
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
              </>
            ) : (
              <>
                <header className="flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:px-3">
                  <button
                    type="button"
                    onClick={showDoctorList}
                    className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-400/35 focus-visible:outline-none"
                    aria-label="Back to doctor list"
                  >
                    <ChevronLeft className="size-5" aria-hidden />
                  </button>
                  {selectedDoctor ? (
                    <DoctorAvatar
                      name={selectedDoctor.name}
                      avatarUrl={selectedDoctor.avatarUrl}
                      sizeClass="size-9"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-100">
                      {selectedDoctor?.name ?? "Doctor"}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {selectedDoctor?.specialty ?? ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-400/35 focus-visible:outline-none"
                    aria-label="Close"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </header>

                <div
                  ref={listRef}
                  className="scrollbar-none min-h-0 flex-1 space-y-3 overflow-y-auto bg-neutral-950 px-3 py-3"
                >
                  {lines.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      Say hello — your messages are saved for this visit preview.
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
                      className="scrollbar-none min-h-0 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-left text-[15px] leading-5 text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
                      style={{ height: CHAT_INPUT_MIN_H, maxHeight: CHAT_INPUT_MAX_H }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={send}
                      disabled={!draft.trim()}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:outline-none"
                      aria-label="Send message"
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </button>
                  </div>
                </footer>
              </>
            )}
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(ui, document.body);
}
