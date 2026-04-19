"use client";

import { useState } from "react";

import { SidebarMotionColumn } from "@/features/app-sidebar";
import type { SidebarArea } from "@/features/app-sidebar";

import { TestHomeContent } from "./ui/test-home";

const PREVIEW_AREA: SidebarArea = "patient";

export function TestSidebarPreview() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMotionColumn
        open={sidebarOpen}
        area={PREVIEW_AREA}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="bg-background flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
        <TestHomeContent />
      </div>
    </div>
  );
}
