"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { BaseRole } from "@/shared/config";
import { routes } from "@/shared/config";
import {
  useIsAuthenticated,
  useIsSessionHydrated,
  useCurrentUser,
} from "../model/selectors";
import { useLandingRoute } from "../model/use-landing-route";

interface RequireRoleProps {
  role: BaseRole;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Gate a route behind a backend base role (`user` / `doctor` / `admin`).
 * Rejected users are sent to their landing route rather than hard-coded
 * paths — that way an org-admin who stumbles onto `/doctor` gets bounced
 * back to `/admin`, not to `/patient`.
 *
 * For the unified admin area use {@link RequireAnyAdmin} instead: platform
 * admin is only one of the three admin flavours, and `RequireRole("admin")`
 * would lock out org-admins and dept-admins.
 */
export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
  const hydrated = useIsSessionHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const landing = useLandingRoute();
  const router = useRouter();

  const hasRole = !!user?.roles.includes(role);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(routes.login);
      return;
    }
    if (!user) return;
    if (!hasRole && landing.href) router.replace(landing.href);
  }, [hydrated, isAuthenticated, user, hasRole, landing.href, router]);

  if (!hydrated || !isAuthenticated || !user || !hasRole) return <>{fallback}</>;
  return <>{children}</>;
}
