"use client";

import { useEffect, useRef } from "react";

import { SidebarMotionColumn } from "@/features/app-sidebar";
import type { SidebarArea } from "@/features/app-sidebar";
import { readSidebarOpenFromStorage } from "@/features/app-sidebar/model/sidebar-preference";
import { useShellUiStore } from "@/features/app-shell";
import { useDoctorChatUiStore } from "@/features/doctor-chat/model/chat-ui-store";
import { cn } from "@/shared/lib/utils";

import { TestHomeContent } from "./ui/test-home";

const PREVIEW_AREA: SidebarArea = "patient";

export function TestSidebarPreview() {
  const sidebarHydrated = useRef(false);
  const sidebarOpen = useShellUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useShellUiStore((s) => s.setSidebarOpen);
  const chatOpen = useDoctorChatUiStore((s) => s.isOpen);
  const chatPanelWidthPx = useDoctorChatUiStore((s) => s.panelWidthPx);

  useEffect(() => {
    if (sidebarHydrated.current) return;
    sidebarHydrated.current = true;
    const saved = readSidebarOpenFromStorage();
    if (saved !== null) useShellUiStore.getState().setSidebarOpen(saved);
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMotionColumn
        open={sidebarOpen}
        area={PREVIEW_AREA}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />
      <div
        className={cn(
          "bg-background flex min-h-0 min-w-0 flex-1 flex-col overflow-auto transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        )}
        style={
          chatOpen ? { paddingRight: chatPanelWidthPx } : undefined
        }
      >
        <TestHomeContent />
      </div>
    </div>
  );
}
