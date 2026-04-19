"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { routes } from "@/shared/config";
import { useSessionStore } from "@/entities/session";

export function useLogout(): () => void {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clear = useSessionStore((s) => s.clear);

  return useCallback(() => {
    clear();
    queryClient.clear();
    router.replace(routes.login);
  }, [clear, queryClient, router]);
}
