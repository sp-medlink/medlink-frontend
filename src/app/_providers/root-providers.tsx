"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { ChatDockGate } from "@/features/doctor-chat/ui/chat-dock-gate";
import { ChatInboxPrefetch } from "@/features/doctor-chat/ui/chat-inbox-prefetch";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryProvider } from "./query-provider";
import { ApiClientBootstrap } from "./api-client-bootstrap";

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ApiClientBootstrap>
        <TooltipProvider delayDuration={200}>
          <ChatInboxPrefetch />
          {children}
          <ChatDockGate />
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </ApiClientBootstrap>
    </QueryProvider>
  );
}
