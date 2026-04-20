"use client";

import dynamic from "next/dynamic";

/**
 * Page surface for /patient/chats and /doctor/chats. Shares the same
 * dynamic chunk as {@link ChatDockGate}'s widget so the inbox-prefetch
 * warmup covers both entry points with a single import graph.
 */
const ChatWidget = dynamic(
  () => import("./chat-widget").then((m) => m.ChatWidget),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[50vh] w-full flex-col gap-3 bg-background p-4"
        aria-busy
        aria-label="Loading chats"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          >
            <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-[58%] max-w-56 animate-pulse rounded bg-muted" />
              <div className="h-3 w-[36%] max-w-36 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
);

export function ChatPageWidget() {
  return <ChatWidget variant="page" />;
}
