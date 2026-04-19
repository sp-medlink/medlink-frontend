"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryProvider } from "./query-provider";
import { ApiClientBootstrap } from "./api-client-bootstrap";

/** Client-only: portal + zustand — skip SSR so dev/RSC never touch this bundle path. */
const DoctorChatWidget = dynamic(
  () =>
    import("@/features/doctor-chat/ui/doctor-chat-widget").then(
      (m) => m.DoctorChatWidget,
    ),
  { ssr: false },
);

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ApiClientBootstrap>
        <TooltipProvider delayDuration={200}>
          {children}
          <DoctorChatWidget />
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </ApiClientBootstrap>
    </QueryProvider>
  );
}
