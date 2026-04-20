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

interface RequireAnyRoleProps {
  roles: readonly BaseRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Like {@link RequireRole} but accepts any of the supplied roles. Used
 * when a route is shared across adjacent roles — e.g. `/doctor/verification`
 * must be reachable both by a plain `user` (completing onboarding to
 * become a doctor) and a `doctor` (checking or resubmitting status).
 */
export function RequireAnyRole({
  roles,
  children,
  fallback = null,
}: RequireAnyRoleProps) {
  const hydrated = useIsSessionHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const landing = useLandingRoute();
  const router = useRouter();

  const hasAnyRole = !!user?.roles.some((r) => roles.includes(r));

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(routes.login);
      return;
    }
    if (!user) return;
    if (!hasAnyRole && landing.href) router.replace(landing.href);
  }, [hydrated, isAuthenticated, user, hasAnyRole, landing.href, router]);

  if (!hydrated || !isAuthenticated || !user || !hasAnyRole) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
