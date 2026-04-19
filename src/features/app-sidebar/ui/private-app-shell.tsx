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
  resolveSettingsSidebarArea,
  type SidebarArea,
} from "../model/nav-config";
import { readSidebarOpenFromStorage } from "../model/sidebar-preference";
import { SidebarMotionColumn } from "./sidebar-motion-column";

interface PrivateAppShellProps {
  children: ReactNode;
}

function isSettingsPath(pathname: string): boolean {
  return pathname === "/settings" || pathname.startsWith("/settings/");
}

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

  useEffect(() => {
    if (areaFromPath) lastAreaRef.current = areaFromPath;
  }, [areaFromPath]);

  const area = useMemo((): SidebarArea | null => {
    if (areaFromPath) return areaFromPath;
    if (isSettingsPath(pathname)) {
      return lastAreaRef.current ?? resolveSettingsSidebarArea(appRole);
    }
    return null;
  }, [pathname, areaFromPath, appRole]);

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
          "min-h-screen min-w-0 flex-1 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        )}
        style={
          chatOpen ? { paddingRight: chatPanelWidthPx } : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
