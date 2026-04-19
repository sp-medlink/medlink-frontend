"use client";

import { Loader2 } from "lucide-react";
import {
  useIsAuthenticated,
  useIsSessionHydrated,
  useCurrentUser,
  useAppRole,
  useAdminCapabilities,
} from "@/entities/session";
import { HomeLandingView, type HomeLandingVariant } from "./home-landing-view";

function resolveLandingVariant(
  anyAdmin: boolean,
  appRole: ReturnType<typeof useAppRole>,
): HomeLandingVariant {
  if (anyAdmin) return "admin";
  if (appRole === "doctor") return "doctor";
  return "patient";
}

/**
 * `/` shows the marketing page for guests. Signed-in users stay on `/` and see
 * the same overview with links for their role (no redirect to /patient etc.).
 */
export function HomePageClient() {
  const hydrated = useIsSessionHydrated();
  const authed = useIsAuthenticated();
  const user = useCurrentUser();
  const appRole = useAppRole();
  const caps = useAdminCapabilities();

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </main>
    );
  }

  if (!authed) {
    return <HomeLandingView variant="marketing" />;
  }

  if (!caps.ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </main>
    );
  }

  const variant = resolveLandingVariant(caps.anyAdmin, appRole);

  return (
    <HomeLandingView
      variant={variant}
      firstName={user?.firstName ?? null}
    />
  );
}
