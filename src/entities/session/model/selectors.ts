"use client";

import type { AppRole, BaseRole } from "@/shared/config";
import { useSessionStore } from "./session-store";
import type { SessionUser } from "./types";

export const useIsAuthenticated = (): boolean =>
  useSessionStore((s) => {
    if (!s.session) return false;
    return s.session.expiresAt * 1000 > Date.now();
  });

export const useCurrentUser = (): SessionUser | null =>
  useSessionStore((s) => s.session?.user ?? null);

export const useHasBaseRole = (role: BaseRole): boolean =>
  useSessionStore((s) => s.session?.user?.roles.includes(role) ?? false);

export const useIsSessionHydrated = (): boolean =>
  useSessionStore((s) => s.hydrated);

export function resolveAppRole(roles: BaseRole[] | undefined): AppRole | null {
  if (!roles || roles.length === 0) return null;
  if (roles.includes("admin")) return "admin";
  if (roles.includes("doctor")) return "doctor";
  if (roles.includes("user")) return "patient";
  return null;
}

export const useAppRole = (): AppRole | null =>
  useSessionStore((s) => resolveAppRole(s.session?.user?.roles));
