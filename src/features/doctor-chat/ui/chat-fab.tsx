"use client";

import { motion, type Variants } from "framer-motion";
import { MessageCircle } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface ChatFabProps {
  unreadCount: number;
  onOpen: () => void;
  variants: Variants;
}

/**
 * Collapsed chat affordance in the corner of the viewport. Surfaces
 * the unread-conversation count so the user can tell at a glance
 * whether anything's waiting.
 */
export function ChatFab({ unreadCount, onOpen, variants }: ChatFabProps) {
  return (
    <motion.button
      key="chat-fab"
      type="button"
      onClick={onOpen}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "fixed right-6 bottom-6 z-120 inline-flex origin-bottom-right items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium text-neutral-100 shadow-2xl backdrop-blur-md hover:brightness-110",
        "border-neutral-700 bg-neutral-950/95 ring-1 ring-neutral-600/50",
        "focus-visible:ring-2 focus-visible:ring-emerald-400/30 focus-visible:outline-none",
      )}
      aria-expanded={false}
      aria-haspopup="dialog"
      style={{ willChange: "transform, opacity" }}
    >
      <span className="relative inline-flex">
        <MessageCircle
          className="size-5 shrink-0 text-emerald-400/90"
          strokeWidth={2}
          aria-hidden
        />
        {unreadCount > 0 ? (
          <span
            className="absolute -top-1.5 -right-2 inline-flex min-w-4.5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-neutral-950"
            aria-label={`${unreadCount} unread conversation${unreadCount === 1 ? "" : "s"}`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </span>
      Chat
    </motion.button>
  );
}
