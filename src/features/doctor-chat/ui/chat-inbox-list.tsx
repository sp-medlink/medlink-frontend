"use client";

import Link from "next/link";
import { Loader2, Minus } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";

import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

import { fetchChatMessages } from "../api/chat-api";
import { doctorChatKeys } from "../api/query-keys";
import type { UnifiedInboxRow } from "../api/types";
import { CHAT_MESSAGES_STALE_MS } from "../model/use-doctor-chat-queries";
import type { ChatUnreadMap } from "../model/use-unread";

import {
  ChatAvatar,
  resolveAvatarUrl,
} from "./chat-message-bubble";
import { PatientChatStartWizard } from "./patient-chat-start-wizard";

interface ChatInboxListProps {
  rows: UnifiedInboxRow[];
  unread: ChatUnreadMap;
  hydrated: boolean;
  isAuthenticated: boolean;
  chatRole: "patient" | "doctor" | null;
  loading: boolean;
  isError: boolean;
  errorMessage: string;
  emptyState: boolean;
  surfaceOpen: boolean;
  onOpenChat: (chatId: string) => void;
  onDismiss: () => void;
  listItemVariants: Variants;
  listContainerVariants: Variants;
}

function formatError(message: string) {
  return message || "Could not load conversations.";
}

export function ChatInboxList({
  rows,
  unread,
  hydrated,
  isAuthenticated,
  chatRole,
  loading,
  isError,
  errorMessage,
  emptyState,
  surfaceOpen,
  onOpenChat,
  onDismiss,
  listContainerVariants,
  listItemVariants,
}: ChatInboxListProps) {
  const queryClient = useQueryClient();

  return (
    <motion.ul
      className="scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      variants={listContainerVariants}
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
              <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-[58%] max-w-56 animate-pulse rounded bg-muted" />
                <div className="h-3 w-[36%] max-w-36 animate-pulse rounded bg-muted" />
              </div>
            </li>
          ))}
        </>
      ) : !isAuthenticated ? (
        <li className="rounded-xl border bg-muted/40 px-3 py-4 text-center text-sm text-muted-foreground">
          <Link
            href={routes.login}
            className="font-medium text-emerald-600 underline-offset-2 hover:underline"
            onClick={onDismiss}
          >
            Sign in
          </Link>{" "}
          to open chats with doctors.
        </li>
      ) : loading ? (
        <li className="flex justify-center py-8">
          <Loader2
            className="size-6 animate-spin text-muted-foreground"
            aria-hidden
          />
        </li>
      ) : isError ? (
        <li className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive">
          {formatError(errorMessage)}
        </li>
      ) : emptyState ? (
        chatRole === "patient" ? (
          <PatientChatStartWizard chatSurfaceActive={surfaceOpen} />
        ) : (
          <li className="flex flex-col items-center gap-3 px-3 py-10 text-center">
            <Minus
              className="size-7 text-muted-foreground"
              strokeWidth={2}
              aria-hidden
            />
            <p className="text-sm font-medium">No chats</p>
            <p className="max-w-[16rem] text-xs leading-relaxed text-muted-foreground">
              When patients message you, conversations will appear here.
            </p>
          </li>
        )
      ) : (
        rows.map((c) => {
          const name = c.peerDisplayName;
          const avatarUrl = resolveAvatarUrl(c.peerAvatarPath);
          const lastAt = new Date(c.lastMessageCreatedAt);
          const lastLabel = formatDistanceToNow(lastAt, {
            addSuffix: true,
            locale: enUS,
          });
          const hasUnread = unread.byChatId[c.chatId] ?? false;
          return (
            <motion.li key={c.chatId} variants={listItemVariants}>
              <button
                type="button"
                onClick={() => {
                  void queryClient.prefetchQuery({
                    queryKey: doctorChatKeys.messages(c.chatId),
                    queryFn: () => fetchChatMessages(c.chatId),
                    staleTime: CHAT_MESSAGES_STALE_MS,
                  });
                  onOpenChat(c.chatId);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:outline-none",
                  hasUnread
                    ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60 hover:bg-emerald-500/10"
                    : "border-transparent bg-muted/40 hover:border-border hover:bg-muted",
                )}
              >
                <ChatAvatar
                  name={name}
                  avatarUrl={avatarUrl}
                  sizeClass="size-11"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        hasUnread ? "font-semibold" : "font-medium",
                      )}
                    >
                      {name}
                    </span>
                    {hasUnread ? (
                      <span
                        className="inline-block size-2 shrink-0 rounded-full bg-emerald-500"
                        aria-label="Unread"
                      />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-xs",
                      hasUnread
                        ? "text-emerald-700"
                        : "text-muted-foreground",
                    )}
                  >
                    {lastLabel}
                  </span>
                </span>
              </button>
            </motion.li>
          );
        })
      )}
    </motion.ul>
  );
}
