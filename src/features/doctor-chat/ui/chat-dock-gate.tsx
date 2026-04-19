"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const DoctorChatWidget = dynamic(
  () =>
    import("./doctor-chat-widget").then((m) => m.DoctorChatWidget),
  { ssr: false },
);

export function ChatDockGate() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/patient/chats") ||
    pathname.startsWith("/doctor/chats")
  ) {
    return null;
  }
  return <DoctorChatWidget />;
}
