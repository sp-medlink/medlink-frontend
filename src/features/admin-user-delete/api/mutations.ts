"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminUserKeys, deleteAdminUser } from "@/entities/admin-user";

/**
 * Deletes a user row via `/user/admin/users/:id`. Platform admins only.
 * Backend refuses to delete the caller themselves (returns 403), so we
 * leave that validation server-side.
 */
export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-user", "delete"],
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: (_, userId) => {
      queryClient.removeQueries({ queryKey: adminUserKeys.detail(userId) });
      void queryClient.invalidateQueries({ queryKey: adminUserKeys.list() });
    },
  });
}
