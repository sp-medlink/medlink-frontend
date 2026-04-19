"use client";

import type { Route } from "next";
import { routes } from "@/shared/config";
import { useAppRole, useIsAuthenticated, useIsSessionHydrated } from "./selectors";
import { useAdminCapabilities } from "./use-admin-capabilities";

/**
 * Single source of truth for "where should this user land after auth?".
 *
 * Priority:
 *   1. Unauthenticated → `/login`.
 *   2. Any admin capability (platform / org / dept) → `/admin` (one unified
 *      area adapts to what they can actually touch).
 *   3. Base role's home page (`/doctor` or `/patient`).
 *
 * Waits on both session hydration and admin-capability probes so we don't
 * flash `/patient` at an org-admin for a tick.
 */
export function useLandingRoute(): { href: Route | null; ready: boolean } {
  const hydrated = useIsSessionHydrated();
  const authed = useIsAuthenticated();
  const baseAppRole = useAppRole();
  const caps = useAdminCapabilities();

  if (!hydrated) return { href: null, ready: false };
  if (!authed) return { href: routes.login, ready: true };
  if (!caps.ready) return { href: null, ready: false };

  if (caps.anyAdmin) return { href: routes.admin.root, ready: true };
  if (baseAppRole === "doctor") return { href: routes.doctor.root, ready: true };
  return { href: routes.patient.root, ready: true };
}
