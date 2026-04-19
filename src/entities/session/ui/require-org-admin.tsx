"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/shared/config";

import {
  useIsAuthenticated,
  useIsSessionHydrated,
} from "../model/selectors";
import { useAdminCapabilities } from "../model/use-admin-capabilities";
import { useLandingRoute } from "../model/use-landing-route";

interface RequireOrgAdminProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Gate for routes that require at least one `orgs_admins` membership.
 * Platform admins pass because `anyOrg` is implicitly true for them
 * (see {@link useAdminCapabilities}); truly-no-org users get bounced
 * to `/admin` (if they have some other admin cap) or their role landing.
 */
export function RequireOrgAdmin({
  children,
  fallback = null,
}: RequireOrgAdminProps) {
  const router = useRouter();
  const hydrated = useIsSessionHydrated();
  const authed = useIsAuthenticated();
  const caps = useAdminCapabilities();
  const landing = useLandingRoute();

  useEffect(() => {
    if (!hydrated || !caps.ready) return;
    if (!authed) {
      router.replace(routes.login);
      return;
    }
    if (caps.anyOrg) return;

    if (caps.anyAdmin) {
      router.replace(routes.admin.root);
      return;
    }
    if (landing.href) {
      router.replace(landing.href);
    }
  }, [
    hydrated,
    authed,
    caps.ready,
    caps.anyOrg,
    caps.anyAdmin,
    landing.href,
    router,
  ]);

  if (!hydrated || !authed || !caps.ready || !caps.anyOrg) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
