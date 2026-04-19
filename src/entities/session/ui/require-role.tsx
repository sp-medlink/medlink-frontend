"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { BaseRole } from "@/shared/config";
import { routes } from "@/shared/config";
import {
  useAppRole,
  useIsAuthenticated,
  useIsSessionHydrated,
  useCurrentUser,
} from "../model/selectors";

interface RequireRoleProps {
  role: BaseRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
  const hydrated = useIsSessionHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const appRole = useAppRole();
  const router = useRouter();

  const hasRole = !!user?.roles.includes(role);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(routes.login);
      return;
    }
    if (!user) return;
    if (!hasRole) {
      if (appRole === "admin") router.replace(routes.admin.root);
      else if (appRole === "doctor") router.replace(routes.doctor.root);
      else router.replace(routes.patient.root);
    }
  }, [hydrated, isAuthenticated, user, hasRole, appRole, router]);

  if (!hydrated || !isAuthenticated || !user || !hasRole) return <>{fallback}</>;
  return <>{children}</>;
}
