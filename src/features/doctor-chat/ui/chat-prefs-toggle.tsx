"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

import { useChatPrefsStore } from "../model/chat-prefs-store";

interface ChatPrefsToggleProps {
  className?: string;
}

/**
 * Two tiny icon toggles rendered in the chat header: sound on/off
 * (synthesised ping on incoming messages) and desktop notifications
 * on/off (native `Notification` API — requires permission). Settings
 * are per-device and live in localStorage via `useChatPrefsStore`.
 */
export function ChatPrefsToggle({ className }: ChatPrefsToggleProps) {
  const soundEnabled = useChatPrefsStore((s) => s.soundEnabled);
  const desktopEnabled = useChatPrefsStore((s) => s.desktopEnabled);
  const toggleSound = useChatPrefsStore((s) => s.toggleSound);
  const toggleDesktop = useChatPrefsStore((s) => s.toggleDesktop);

  const [desktopSupported, setDesktopSupported] = useState(false);
  useEffect(() => {
    setDesktopSupported(
      typeof window !== "undefined" &&
        typeof window.Notification !== "undefined",
    );
  }, []);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-400/35 focus-visible:outline-none"
          >
            {soundEnabled ? (
              <Volume2 className="size-4" aria-hidden />
            ) : (
              <VolumeX className="size-4" aria-hidden />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {soundEnabled ? "Sound on" : "Sound muted"}
        </TooltipContent>
      </Tooltip>

      {desktopSupported ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => void toggleDesktop()}
              aria-pressed={desktopEnabled}
              aria-label={
                desktopEnabled
                  ? "Disable desktop notifications"
                  : "Enable desktop notifications"
              }
              className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-400/35 focus-visible:outline-none"
            >
              {desktopEnabled ? (
                <Bell className="size-4" aria-hidden />
              ) : (
                <BellOff className="size-4" aria-hidden />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {desktopEnabled
              ? "Desktop notifications on"
              : "Desktop notifications off"}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}
