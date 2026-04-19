"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useAppRole } from "@/entities/session";

import {
  getSidebarAreaFromPath,
  resolveSettingsSidebarArea,
  type SidebarArea,
} from "../model/nav-config";
import {
  readSidebarOpenFromStorage,
  writeSidebarOpenToStorage,
} from "../model/sidebar-preference";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    const saved = readSidebarOpenFromStorage();
    if (saved !== null) setSidebarOpen(saved);
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setSidebarOpen(open);
    writeSidebarOpenToStorage(open);
  }, []);

  if (!area) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMotionColumn
        open={sidebarOpen}
        area={area}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />
      <div className="min-h-screen min-w-0 flex-1">{children}</div>
    </div>
  );
}
