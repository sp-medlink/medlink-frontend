"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Session, SessionUser } from "./types";

interface SessionState {
  session: Session | null;
  hydrated: boolean;
  setToken: (token: string, expiresAt: number) => void;
  setUser: (user: SessionUser) => void;
  clear: () => void;
  markHydrated: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      hydrated: false,
      setToken: (token, expiresAt) =>
        set((state) => ({
          session: {
            token,
            expiresAt,
            user: state.session?.user ?? null,
          },
        })),
      setUser: (user) =>
        set((state) =>
          state.session
            ? { session: { ...state.session, user } }
            : state,
        ),
      clear: () => set({ session: null }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "medlink.session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

export const getSessionToken = (): string | null => {
  const s = useSessionStore.getState().session;
  if (!s) return null;
  if (s.expiresAt * 1000 <= Date.now()) return null;
  return s.token;
};
