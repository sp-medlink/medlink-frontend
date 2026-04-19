"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated, useIsSessionHydrated } from "../model/selectors";
import { useLandingRoute } from "../model/use-landing-route";

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
}

/**
 * Bounces an already-authenticated user away from public pages (login /
 * signup) to wherever `useLandingRoute` decides they belong.
 */
export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const hydrated = useIsSessionHydrated();
  const authed = useIsAuthenticated();
  const landing = useLandingRoute();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || !authed) return;
    if (landing.href) router.replace(landing.href);
  }, [hydrated, authed, landing.href, router]);

  if (hydrated && authed) return null;
  return <>{children}</>;
}
