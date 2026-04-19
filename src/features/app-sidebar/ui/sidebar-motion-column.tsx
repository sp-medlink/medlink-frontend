"use client";

import { motion, useReducedMotion } from "framer-motion";

import { AppSidebar } from "./app-sidebar";
import type { SidebarArea } from "../model/nav-config";

const WIDTH_EXPANDED = "16rem";
const WIDTH_COLLAPSED = "4.5rem";

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
        className={`fixed top-0 left-0 z-40 flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden ${sidebarSurfaceClass(open)}`}
        {...widthMotion}
      >
        <AppSidebar
          area={area}
          expanded={open}
          onToggle={() => (open ? onClose() : onOpen())}
        />
      </motion.div>
    </>
  );
}
