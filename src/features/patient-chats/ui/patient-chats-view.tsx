"use client";

import { DoctorChatPageWidget } from "@/features/doctor-chat/ui/doctor-chat-page-widget";

export function PatientChatsView() {
  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      <DoctorChatPageWidget />
    </div>
  );
}
