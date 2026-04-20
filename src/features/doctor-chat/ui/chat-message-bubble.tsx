"use client";

import { useState } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { env } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

import type { ChatLine } from "../model/chat-ui-store";

/* --------- helpers shared across bubble, header avatar, inbox row --- */

export function resolveAvatarUrl(
  path: string | null | undefined,
): string | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${env.apiBaseUrl}${p}`;
  return p;
}

export function initialsOf(name: string): string {
  const parts = name
    .replace(/^Dr\.\s*/i, "")
    .trim()
    .split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

export function startOfLocalDay(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function formatChatDateLabel(ts: number, nowMs: number): string {
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

export function formatMessageTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/* --------- shared avatar ------------------------------------------- */

interface ChatAvatarProps {
  name: string;
  avatarUrl?: string | null;
  sizeClass?: string;
}

export function ChatAvatar({
  name,
  avatarUrl,
  sizeClass = "size-11",
}: ChatAvatarProps) {
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
        // External avatars are dynamic per peer; next/image would need
        // remotePatterns listed for every host so we stick to a plain img.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl!}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-[0.7rem] font-semibold tracking-tight text-neutral-200">
          {initialsOf(name)}
        </span>
      )}
    </span>
  );
}

/* --------- message bubble ------------------------------------------ */

export interface ChatMessageBubbleProps {
  m: ChatLine;
  /** Tight spacing when this message burst-continues the previous one. */
  grouped?: boolean;
  /** Retry a failed send — only meaningful for `m.pending === "failed"`. */
  onRetry?: () => void;
  /** Discard a failed send — pairs with `onRetry`. */
  onDiscard?: () => void;
}

export function ChatMessageBubble({
  m,
  grouped,
  onRetry,
  onDiscard,
}: ChatMessageBubbleProps) {
  const timeStr = formatMessageTime(m.createdAt);
  const iso = new Date(m.createdAt).toISOString();
  const failed = m.pending === "failed";
  const sending = m.pending === "sending";

  return (
    <div
      className={cn(
        "flex w-full",
        grouped ? "mt-0.5" : "mt-2",
        m.role === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "wrap-anywhere flex min-w-0 w-fit max-w-[92%] flex-col gap-1 rounded-2xl px-4 py-2 text-left text-[13px] leading-snug whitespace-pre-wrap",
          m.role === "user"
            ? failed
              ? "bg-red-950/40 text-red-100 ring-1 ring-red-900/60"
              : "bg-neutral-800 text-neutral-100"
            : "bg-neutral-900 text-neutral-100 ring-1 ring-neutral-800",
          sending ? "opacity-70" : undefined,
        )}
      >
        <span className="min-w-0">{m.body}</span>
        <div className="flex shrink-0 items-center justify-end gap-1.5">
          {sending ? (
            <span
              className="text-[11px] leading-none text-neutral-400"
              aria-label="Sending"
            >
              Sending…
            </span>
          ) : null}
          {failed ? (
            <span className="inline-flex items-center gap-1 text-[11px] leading-none text-red-300">
              <TriangleAlert className="size-3" aria-hidden />
              Failed
            </span>
          ) : null}
          {failed && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-[11px] leading-none text-red-200 underline-offset-2 hover:underline"
              aria-label="Retry sending"
            >
              <RotateCcw className="size-3" aria-hidden />
              Retry
            </button>
          ) : null}
          {failed && onDiscard ? (
            <button
              type="button"
              onClick={onDiscard}
              className="rounded px-1 py-0.5 text-[11px] leading-none text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline"
              aria-label="Discard failed message"
            >
              Discard
            </button>
          ) : null}
          {!sending && !failed ? (
            <time
              dateTime={iso}
              className={cn(
                "text-[11px] leading-none tabular-nums tracking-tight select-none",
                m.role === "user" ? "text-neutral-400" : "text-neutral-500",
              )}
            >
              {timeStr}
            </time>
          ) : null}
        </div>
      </div>
    </div>
  );
}
