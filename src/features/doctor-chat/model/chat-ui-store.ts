"use client";

import { create } from "zustand";

import { useShellUiStore } from "@/features/app-shell/model/shell-ui-store";

export type DoctorChatView = "list" | "chat";

export type PendingState = "sending" | "failed";

export interface ChatLine {
  id: string;
  role: "user" | "doctor";
  body: string;
  createdAt: number;
  /** Present only for optimistic bubbles awaiting server ack or failing. */
  pending?: PendingState;
  /** Echoes the text back to the retry flow when a send fails. */
  draftText?: string;
}

/** Default matches previous `sm:w-96` (384px). */
export const CHAT_PANEL_WIDTH_DEFAULT = 384;
export const CHAT_PANEL_WIDTH_MIN = 260;
export const CHAT_PANEL_WIDTH_MAX = 720;

const STORAGE_KEY_PANEL_WIDTH = "medlink-doctor-chat-panel-width";
const STORAGE_KEY_LAST_READ = "medlink-chat-last-read";
const STORAGE_KEY_DRAFTS = "medlink-chat-drafts";

function clampPanelWidth(w: number): number {
  const v = Math.round(w);
  if (typeof window === "undefined") {
    return Math.min(CHAT_PANEL_WIDTH_MAX, Math.max(CHAT_PANEL_WIDTH_MIN, v));
  }
  const max = Math.min(CHAT_PANEL_WIDTH_MAX, Math.max(CHAT_PANEL_WIDTH_MIN, window.innerWidth - 24));
  return Math.min(max, Math.max(CHAT_PANEL_WIDTH_MIN, v));
}

function readJsonFromStorage<T>(
  key: string,
  storage: Storage | null,
): Record<string, T> {
  if (!storage) return {};
  try {
    const raw = storage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, T>;
    }
    return {};
  } catch {
    return {};
  }
}

function writeJsonToStorage(
  key: string,
  value: Record<string, unknown>,
  storage: Storage | null,
): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}
function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

interface ChatUiState {
  isOpen: boolean;
  view: DoctorChatView;
  /** Open conversation (`/user/me/chats/{id}`). */
  selectedChatId: string | null;
  /** Panel width when open; drives layout padding elsewhere. */
  panelWidthPx: number;
  /** Per-chat "latest seen message timestamp" — drives unread state. */
  lastReadAt: Record<string, string>;
  /** Per-chat textarea draft — survives switching chats and page reloads. */
  drafts: Record<string, string>;
  setPanelWidthPx: (px: number) => void;
  open: () => void;
  close: () => void;
  /** Back to inbox (conversation list). */
  showChatList: () => void;
  openChat: (chatId: string) => void;
  /** Record the latest message timestamp the user has seen for a chat. */
  markChatRead: (chatId: string, iso: string) => void;
  setDraft: (chatId: string, text: string) => void;
  clearDraft: (chatId: string) => void;
}

export const useDoctorChatUiStore = create<ChatUiState>((set) => ({
  isOpen: false,
  view: "list",
  selectedChatId: null,
  panelWidthPx: CHAT_PANEL_WIDTH_DEFAULT,
  lastReadAt: {},
  drafts: {},
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
  markChatRead: (chatId, iso) =>
    set((s) => {
      const current = s.lastReadAt[chatId];
      // ISO strings sort lexicographically — safe to compare as strings.
      // Guards against regressing the marker with an older timestamp.
      if (current && current >= iso) return s;
      const next = { ...s.lastReadAt, [chatId]: iso };
      writeJsonToStorage(STORAGE_KEY_LAST_READ, next, getLocalStorage());
      return { lastReadAt: next };
    }),
  setDraft: (chatId, text) =>
    set((s) => {
      const next = { ...s.drafts };
      if (text === "") {
        delete next[chatId];
      } else {
        next[chatId] = text;
      }
      writeJsonToStorage(STORAGE_KEY_DRAFTS, next, getSessionStorage());
      return { drafts: next };
    }),
  clearDraft: (chatId) =>
    set((s) => {
      if (!(chatId in s.drafts)) return s;
      const next = { ...s.drafts };
      delete next[chatId];
      writeJsonToStorage(STORAGE_KEY_DRAFTS, next, getSessionStorage());
      return { drafts: next };
    }),
}));

/**
 * Call once on client so persisted state (panel width, last-read,
 * drafts) matches the last session without flashing defaults.
 */
export function hydrateChatUiFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const rawWidth = localStorage.getItem(STORAGE_KEY_PANEL_WIDTH);
    if (rawWidth) {
      const n = parseInt(rawWidth, 10);
      if (!Number.isNaN(n)) {
        useDoctorChatUiStore.setState({ panelWidthPx: clampPanelWidth(n) });
      }
    }
  } catch {
    /* noop */
  }

  useDoctorChatUiStore.setState({
    lastReadAt: readJsonFromStorage<string>(
      STORAGE_KEY_LAST_READ,
      getLocalStorage(),
    ),
    drafts: readJsonFromStorage<string>(
      STORAGE_KEY_DRAFTS,
      getSessionStorage(),
    ),
  });
}

/** Alias kept for call sites that still reference the old name. */
export const hydrateChatPanelWidthFromStorage = hydrateChatUiFromStorage;
