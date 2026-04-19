"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/shared/config";
import { useIsAuthenticated, useIsSessionHydrated } from "../model/selectors";
import { useAdminCapabilities } from "../model/use-admin-capabilities";
import { useLandingRoute } from "../model/use-landing-route";

interface RequireAnyAdminProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Gate for the unified `/admin` area. Grants access if the user has any
 * admin capability at all — platform, org, or department. Mirrors the
 * backend's "admin-hood is data ownership" model: we don't care which
 * flavour, only whether they can administer *something*.
 *
 * Users without any admin capability are bounced to their landing route
 * (typically `/patient` or `/doctor`).
 */
export function RequireAnyAdmin({ children, fallback = null }: RequireAnyAdminProps) {
  const router = useRouter();
  const hydrated = useIsSessionHydrated();
  const authed = useIsAuthenticated();
  const caps = useAdminCapabilities();
  const landing = useLandingRoute();

  useEffect(() => {
    if (!hydrated) return;
    if (!authed) {
      router.replace(routes.login);
      return;
    }
    if (!caps.ready) return;
    if (caps.anyAdmin) return;
    if (landing.href) router.replace(landing.href);
  }, [hydrated, authed, caps.ready, caps.anyAdmin, landing.href, router]);

  if (!hydrated || !authed || !caps.ready || !caps.anyAdmin) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
