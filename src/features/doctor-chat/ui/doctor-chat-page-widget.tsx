"use client";

import dynamic from "next/dynamic";

/**
 * Same dynamic chunk as {@link ChatDockGate}'s DoctorChatWidget so
 * ChatInboxPrefetch's `import("…/doctor-chat-widget")` warms this module.
 * Static import in route pages would load a separate graph and skip the dock
 * preload on direct /patient|doctor/chats visits.
 */
const DoctorChatWidget = dynamic(
  () =>
    import("./doctor-chat-widget").then((m) => m.DoctorChatWidget),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[50vh] w-full flex-col gap-3 bg-neutral-950 p-4"
        aria-busy
        aria-label="Loading chats"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          >
            <div className="size-11 shrink-0 animate-pulse rounded-full bg-neutral-800" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-[58%] max-w-56 animate-pulse rounded bg-neutral-800" />
              <div className="h-3 w-[36%] max-w-36 animate-pulse rounded bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
);

export function DoctorChatPageWidget() {
  return <DoctorChatWidget variant="page" />;
}
