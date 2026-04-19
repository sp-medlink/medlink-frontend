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

interface RequirePlatformAdminProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Stricter gate than {@link RequireAnyAdmin}: only users with the `admin`
 * base role pass. Anyone else is routed to their best landing page (or
 * `/admin` if they have some admin capability). Used by
 * platform-admin-only surfaces like `/admin/admins`.
 */
export function RequirePlatformAdmin({
  children,
  fallback = null,
}: RequirePlatformAdminProps) {
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
    if (!caps.platform) {
      if (caps.anyAdmin) {
        router.replace(routes.admin.root);
        return;
      }
      if (landing.href) {
        router.replace(landing.href);
      }
    }
  }, [
    hydrated,
    authed,
    caps.ready,
    caps.platform,
    caps.anyAdmin,
    landing.href,
    router,
  ]);

  if (!hydrated || !authed || !caps.ready || !caps.platform) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
