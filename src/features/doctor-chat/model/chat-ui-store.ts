"use client";

import { create } from "zustand";

import { useShellUiStore } from "@/features/app-shell/model/shell-ui-store";

export type DoctorChatView = "list" | "chat";

export interface ChatLine {
  id: string;
  role: "user" | "doctor";
  body: string;
  createdAt: number;
}

/** Default matches previous `sm:w-96` (384px). */
export const CHAT_PANEL_WIDTH_DEFAULT = 384;
export const CHAT_PANEL_WIDTH_MIN = 260;
export const CHAT_PANEL_WIDTH_MAX = 720;

const STORAGE_KEY_PANEL_WIDTH = "medlink-doctor-chat-panel-width";

function clampPanelWidth(w: number): number {
  const v = Math.round(w);
  if (typeof window === "undefined") {
    return Math.min(CHAT_PANEL_WIDTH_MAX, Math.max(CHAT_PANEL_WIDTH_MIN, v));
  }
  const max = Math.min(CHAT_PANEL_WIDTH_MAX, Math.max(CHAT_PANEL_WIDTH_MIN, window.innerWidth - 24));
  return Math.min(max, Math.max(CHAT_PANEL_WIDTH_MIN, v));
}

interface ChatUiState {
  isOpen: boolean;
  view: DoctorChatView;
  /** Open conversation (`/user/me/chats/{id}`). */
  selectedChatId: string | null;
  /** Panel width when open; drives layout padding elsewhere. */
  panelWidthPx: number;
  setPanelWidthPx: (px: number) => void;
  open: () => void;
  close: () => void;
  /** Back to inbox (conversation list). */
  showChatList: () => void;
  openChat: (chatId: string) => void;
}

export const useDoctorChatUiStore = create<ChatUiState>((set) => ({
  isOpen: false,
  view: "list",
  selectedChatId: null,
  panelWidthPx: CHAT_PANEL_WIDTH_DEFAULT,
  setPanelWidthPx: (px) => {
    const next = clampPanelWidth(px);
    try {
      localStorage.setItem(STORAGE_KEY_PANEL_WIDTH, String(next));
    } catch {
      /* ignore quota / private mode */
    }
    set({ panelWidthPx: next });
  },
  open: () => {
    useShellUiStore.getState().setSidebarOpen(false);
    set({ isOpen: true });
  },
  close: () =>
    set({
      isOpen: false,
      view: "list",
      selectedChatId: null,
    }),
  showChatList: () => set({ view: "list", selectedChatId: null }),
  openChat: (chatId) => set({ view: "chat", selectedChatId: chatId }),
}));

/** Call once on client so width matches last session without flashing defaults. */
export function hydrateChatPanelWidthFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PANEL_WIDTH);
    if (!raw) return;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    useDoctorChatUiStore.setState({ panelWidthPx: clampPanelWidth(n) });
  } catch {
    /* noop */
  }
}
