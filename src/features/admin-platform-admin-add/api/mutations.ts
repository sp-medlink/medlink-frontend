"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addPlatformAdmin,
  platformAdminKeys,
} from "@/entities/platform-admin";

export function useAddPlatformAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-platform-admin", "add"],
    mutationFn: (userId: string) => addPlatformAdmin(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: platformAdminKeys.list(),
      });
    },
  });
}
