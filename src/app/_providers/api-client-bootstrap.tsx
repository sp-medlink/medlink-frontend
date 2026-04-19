"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError, configureApiClient } from "@/shared/api";
import { routes } from "@/shared/config";
import {
  fetchMe,
  getSessionToken,
  useIsSessionHydrated,
  useSessionStore,
} from "@/entities/session";

export function ApiClientBootstrap({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useIsSessionHydrated();
  const session = useSessionStore((s) => s.session);
  const setUser = useSessionStore((s) => s.setUser);
  const clear = useSessionStore((s) => s.clear);
  const configured = useRef(false);

  useEffect(() => {
    if (configured.current) return;
    configured.current = true;
    configureApiClient({
      getToken: () => getSessionToken(),
      onUnauthorized: () => {
        clear();
        router.replace(routes.login);
      },
    });
  }, [router, clear]);

  useEffect(() => {
    if (!hydrated) return;
    const token = session?.token;
    const exp = session?.expiresAt ?? 0;
    if (!token) return;
    if (exp * 1000 <= Date.now()) {
      clear();
      return;
    }
    if (session?.user) return;
    let cancelled = false;
    fetchMe()
      .then((user) => {
        if (!cancelled) setUser(user);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isUnauthorized) {
          clear();
        } else {
          toast.error("Could not load session, please log in again");
          clear();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, session?.token, session?.expiresAt, session?.user, setUser, clear]);

  return <>{children}</>;
}
