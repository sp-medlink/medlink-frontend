"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

import { useAppRole } from "@/entities/session";
import { useShellUiStore } from "@/features/app-shell";
import { useDoctorChatUiStore } from "@/features/doctor-chat/model/chat-ui-store";
import { cn } from "@/shared/lib/utils";

import {
  getSidebarAreaFromPath,
  resolveSidebarAreaFromAppRole,
  type SidebarArea,
} from "../model/nav-config";
import { readSidebarOpenFromStorage } from "../model/sidebar-preference";
import { SidebarMotionColumn } from "./sidebar-motion-column";

interface PrivateAppShellProps {
  children: ReactNode;
}

/**
 * Wraps every private route in the sidebar shell. The area is resolved in
 * this order:
 *
 *   1. Area implied by the URL path (`/patient`, `/doctor`, `/admin`).
 *   2. Last-seen area from the current navigation session — keeps
 *      `/settings` feeling attached to whatever the user was just working
 *      in.
 *   3. Fallback from the user's base app role.
 *
 * The admin area is intentionally *not* role-based — a patient who is also
 * an org-admin still sees the patient sidebar by default, with an "Admin"
 * shortcut injected (see `AppSidebar`).
 */
export function PrivateAppShell({ children }: PrivateAppShellProps) {
  const pathname = usePathname();
  const appRole = useAppRole();
  const areaFromPath = getSidebarAreaFromPath(pathname);
  const lastAreaRef = useRef<SidebarArea | null>(null);
  const sidebarHydrated = useRef(false);
  const sidebarOpen = useShellUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useShellUiStore((s) => s.setSidebarOpen);
  const chatOpen = useDoctorChatUiStore((s) => s.isOpen);
  const chatPanelWidthPx = useDoctorChatUiStore((s) => s.panelWidthPx);
  const isChatsFullPageRoute =
    pathname.startsWith("/patient/chats") ||
    pathname.startsWith("/doctor/chats");

  useEffect(() => {
    if (areaFromPath) lastAreaRef.current = areaFromPath;
  }, [areaFromPath]);

  const area = useMemo((): SidebarArea | null => {
    if (areaFromPath) return areaFromPath;
    return lastAreaRef.current ?? resolveSidebarAreaFromAppRole(appRole);
  }, [areaFromPath, appRole]);

  useEffect(() => {
    if (sidebarHydrated.current) return;
    sidebarHydrated.current = true;
    const saved = readSidebarOpenFromStorage();
    if (saved !== null) useShellUiStore.getState().setSidebarOpen(saved);
  }, []);

  if (!area) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMotionColumn
        open={sidebarOpen}
        area={area}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        )}
        style={
          chatOpen && !isChatsFullPageRoute
            ? { paddingRight: chatPanelWidthPx }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
