"use client";

import { ChatPageWidget } from "@/features/doctor-chat/ui/chat-page-widget";

export function DoctorChatsView() {
  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      <ChatPageWidget />
    </div>
  );
}
