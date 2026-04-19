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

export function SidebarMotionColumn({ open, onOpen, onClose, area }: SidebarMotionColumnProps) {
  const reduceMotion = useReducedMotion();
  const shellTransition = reduceMotion ? { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } : panelSpring;

  return (
    <div className="relative flex shrink-0">
      <motion.div
        className={
          open
            ? "relative min-h-screen shrink-0 overflow-hidden border-r border-neutral-200 bg-neutral-50 shadow-[2px_0_24px_-12px_rgba(0,0,0,0.12)] dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-[2px_0_24px_-12px_rgba(0,0,0,0.4)]"
            : "relative min-h-screen shrink-0 overflow-hidden border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950"
        }
        initial={false}
        animate={{
          width: open ? WIDTH_EXPANDED : WIDTH_COLLAPSED,
        }}
        transition={shellTransition}
      >
        <AppSidebar
          area={area}
          expanded={open}
          onToggle={() => (open ? onClose() : onOpen())}
        />
      </motion.div>
    </div>
  );
}
