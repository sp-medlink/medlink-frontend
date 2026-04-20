"use client";

import { create } from "zustand";

const STORAGE_KEY = "medlink-chat-prefs";

export interface ChatPrefs {
  /** Play a short ping on incoming messages (while tab has focus). */
  soundEnabled: boolean;
  /**
   * Fire native Notification API when the tab is hidden / backgrounded.
   * Requires the user to grant permission once via the browser prompt.
   */
  desktopEnabled: boolean;
}

interface ChatPrefsState extends ChatPrefs {
  toggleSound: () => void;
  toggleDesktop: () => Promise<void>;
  hydrate: () => void;
}

const DEFAULTS: ChatPrefs = {
  soundEnabled: true,
  desktopEnabled: false,
};

function readPrefs(): ChatPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ChatPrefs>;
    return {
      soundEnabled: parsed.soundEnabled ?? DEFAULTS.soundEnabled,
      desktopEnabled: parsed.desktopEnabled ?? DEFAULTS.desktopEnabled,
    };
  } catch {
    return DEFAULTS;
  }
}

function writePrefs(prefs: ChatPrefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota / private mode */
  }
}

export const useChatPrefsStore = create<ChatPrefsState>((set, get) => ({
  ...DEFAULTS,
  toggleSound: () => {
    const next = { ...get(), soundEnabled: !get().soundEnabled };
    writePrefs({
      soundEnabled: next.soundEnabled,
      desktopEnabled: next.desktopEnabled,
    });
    set({ soundEnabled: next.soundEnabled });
  },
  toggleDesktop: async () => {
    const currentlyEnabled = get().desktopEnabled;
    if (currentlyEnabled) {
      writePrefs({ soundEnabled: get().soundEnabled, desktopEnabled: false });
      set({ desktopEnabled: false });
      return;
    }

    if (
      typeof window === "undefined" ||
      typeof window.Notification === "undefined"
    ) {
      return;
    }

    let permission = Notification.permission;
    if (permission === "default") {
      try {
        permission = await Notification.requestPermission();
      } catch {
        permission = "denied";
      }
    }

    if (permission !== "granted") {
      // Leave the toggle off — the user hasn't granted us anything.
      return;
    }

    writePrefs({ soundEnabled: get().soundEnabled, desktopEnabled: true });
    set({ desktopEnabled: true });
  },
  hydrate: () => {
    const stored = readPrefs();
    set(stored);
  },
}));

/**
 * Can we show native desktop notifications right now? Combines user
 * preference with current browser permission — the user might have
 * revoked permission after enabling the toggle.
 */
export function canUseDesktopNotifications(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.Notification === "undefined") return false;
  return (
    useChatPrefsStore.getState().desktopEnabled &&
    Notification.permission === "granted"
  );
}

/** Short synthesised ping — no asset file required. */
export function playIncomingMessageSound(): void {
  if (typeof window === "undefined") return;
  if (!useChatPrefsStore.getState().soundEnabled) return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    // Very short envelope — ~120ms ping at low volume.
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    /* muted autoplay policy or similar — soft fail */
  }
}
