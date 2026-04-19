"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/shared/config";
import {
  useAppRole,
  useIsAuthenticated,
  useIsSessionHydrated,
} from "../model/selectors";

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
}

export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const hydrated = useIsSessionHydrated();
  const isAuthenticated = useIsAuthenticated();
  const appRole = useAppRole();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    if (appRole === "admin") router.replace(routes.admin.root);
    else if (appRole === "doctor") router.replace(routes.doctor.root);
    else router.replace(routes.patient.root);
  }, [hydrated, isAuthenticated, appRole, router]);

  if (hydrated && isAuthenticated) return null;
  return <>{children}</>;
}
