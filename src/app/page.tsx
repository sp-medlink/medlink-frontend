"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { routes } from "@/shared/config";
import {
  useAppRole,
  useIsAuthenticated,
  useIsSessionHydrated,
} from "@/entities/session";

export default function Page() {
  const router = useRouter();
  const hydrated = useIsSessionHydrated();
  const isAuthenticated = useIsAuthenticated();
  const appRole = useAppRole();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(routes.login);
      return;
    }
    if (appRole === "admin") router.replace(routes.admin.root);
    else if (appRole === "doctor") router.replace(routes.doctor.root);
    else router.replace(routes.patient.root);
  }, [hydrated, isAuthenticated, appRole, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
    </main>
  );
}
