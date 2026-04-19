"use client";

import { create } from "zustand";

import { writeSidebarOpenToStorage } from "@/features/app-sidebar/model/sidebar-preference";

interface ShellUiState {
  /** Matches expanded sidebar (wide rail). Persisted via sidebar-preference helpers from callers. */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useShellUiStore = create<ShellUiState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
    writeSidebarOpenToStorage(open);
    if (open) {
      void import("@/features/doctor-chat/model/chat-ui-store").then((m) => {
        m.useDoctorChatUiStore.getState().close();
      });
    }
  },
}));
