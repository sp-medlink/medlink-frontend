"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/shared/config";
import { useIsAuthenticated, useIsSessionHydrated } from "../model/selectors";

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const hydrated = useIsSessionHydrated();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace(routes.login);
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return <>{fallback}</>;
  return <>{children}</>;
}
