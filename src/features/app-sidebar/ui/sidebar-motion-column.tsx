"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { AppSidebar } from "./app-sidebar";
import type { SidebarArea } from "../model/nav-config";
import { cn } from "@/shared/lib/utils";

const WIDTH_EXPANDED = "18rem";
const WIDTH_COLLAPSED = "4.75rem";

const panelSpring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 42,
  mass: 0.95,
};

interface SidebarMotionColumnProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  area: SidebarArea;
}

function sidebarSurfaceClass(open: boolean): string {
  return open
    ? "border-r border-neutral-200 bg-neutral-50 shadow-[2px_0_24px_-12px_rgba(0,0,0,0.12)] dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-[2px_0_24px_-12px_rgba(0,0,0,0.4)]"
    : "border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950";
}

export function SidebarMotionColumn({ open, onOpen, onClose, area }: SidebarMotionColumnProps) {
  const reduceMotion = useReducedMotion();
  const shellTransition = reduceMotion ? { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } : panelSpring;

  const widthMotion = {
    initial: false as const,
    animate: { width: open ? WIDTH_EXPANDED : WIDTH_COLLAPSED },
    transition: shellTransition,
  };

  return (
    <>
      {/* Keeps main content offset while the real sidebar is position:fixed */}
      <motion.div aria-hidden className="shrink-0" {...widthMotion} />
      <motion.div
        className={`fixed top-0 left-0 z-40 flex h-dvh max-h-dvh min-h-0 flex-col overflow-visible ${sidebarSurfaceClass(open)}`}
        {...widthMotion}
      >
        <AppSidebar area={area} expanded={open} />
        <button
          type="button"
          onClick={() => (open ? onClose() : onOpen())}
          aria-expanded={open}
          aria-controls="app-sidebar"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          title={open ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(
            "absolute top-1/2 right-0 z-50 inline-flex size-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-white shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 active:scale-[0.97]",
            "border-emerald-700/30 bg-emerald-600 ring-2 ring-emerald-400/30 hover:bg-emerald-500",
            "dark:border-emerald-400/40 dark:bg-emerald-500 dark:ring-emerald-300/25 dark:hover:bg-emerald-400",
          )}
        >
          <ChevronLeft
            className={cn(
              "size-4 transition-transform duration-200",
              open ? "rotate-0" : "rotate-180",
            )}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>
      </motion.div>
    </>
  );
}
