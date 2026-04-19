"use client";

import { create } from "zustand";

import { useShellUiStore } from "@/features/app-shell/model/shell-ui-store";

export type DoctorChatView = "list" | "chat";

export interface DoctorOption {
  id: string;
  name: string;
  specialty: string;
  /** Profile photo URL; if missing or load fails, UI shows initials. */
  avatarUrl?: string | null;
}

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
  selectedDoctorId: string | null;
  threads: Record<string, ChatLine[]>;
  /** Panel width when open; drives layout padding elsewhere. */
  panelWidthPx: number;
  setPanelWidthPx: (px: number) => void;
  open: () => void;
  close: () => void;
  showDoctorList: () => void;
  pickDoctor: (id: string) => void;
  appendMessage: (doctorId: string, role: "user" | "doctor", body: string) => void;
  clearThread: (doctorId: string) => void;
}

function newLine(role: "user" | "doctor", body: string): ChatLine {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    body,
    createdAt: Date.now(),
  };
}

export const useDoctorChatUiStore = create<ChatUiState>((set) => ({
  isOpen: false,
  view: "list",
  selectedDoctorId: null,
  threads: {},
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
      selectedDoctorId: null,
    }),
  showDoctorList: () => set({ view: "list", selectedDoctorId: null }),
  pickDoctor: (id) => set({ view: "chat", selectedDoctorId: id }),
  appendMessage: (doctorId, role, body) => {
    const line = newLine(role, body);
    set((state) => ({
      threads: {
        ...state.threads,
        [doctorId]: [...(state.threads[doctorId] ?? []), line],
      },
    }));
  },
  clearThread: (doctorId) =>
    set((state) => {
      const next = { ...state.threads };
      delete next[doctorId];
      return { threads: next };
    }),
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
