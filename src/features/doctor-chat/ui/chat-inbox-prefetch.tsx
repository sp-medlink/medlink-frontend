"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect } from "react";

import {
  useAppRole,
  useIsAuthenticated,
  useIsSessionHydrated,
} from "@/entities/session";

import {
  fetchUnifiedInboxForDoctor,
  fetchUnifiedInboxForPatient,
} from "../api/chat-api";
import { doctorChatKeys } from "../api/query-keys";
import { CHAT_INBOX_STALE_MS } from "../model/use-doctor-chat-queries";

/**
 * Warms inbox data and the chat widget JS chunk as soon as the session
 * is ready. On /patient|doctor/chats the dock is not mounted
 * (ChatDockGate returns null), so without this preload the chat page
 * pays a cold chunk load; browsing other routes loads the dock via
 * dynamic() and the chunk is already warm.
 */
export function ChatInboxPrefetch() {
  const qc = useQueryClient();
  const hydrated = useIsSessionHydrated();
  const isAuthenticated = useIsAuthenticated();
  const appRole = useAppRole();

  useLayoutEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    if (appRole !== "doctor" && appRole !== "patient") return;

    void import("./chat-widget");

    void qc.prefetchQuery({
      queryKey: doctorChatKeys.inbox(appRole),
      queryFn: () =>
        appRole === "doctor"
          ? fetchUnifiedInboxForDoctor()
          : fetchUnifiedInboxForPatient(),
      staleTime: CHAT_INBOX_STALE_MS,
    });
  }, [hydrated, isAuthenticated, appRole, qc]);

  return null;
}
