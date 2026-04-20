"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatWidget = dynamic(
  () => import("./chat-widget").then((m) => m.ChatWidget),
  { ssr: false },
);

/**
 * Mounts the chat dock everywhere *except* the dedicated /chats
 * routes — those render the page variant themselves, and stacking the
 * dock on top would duplicate the surface.
 */
export function ChatDockGate() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/patient/chats") ||
    pathname.startsWith("/doctor/chats")
  ) {
    return null;
  }
  return <ChatWidget />;
}
