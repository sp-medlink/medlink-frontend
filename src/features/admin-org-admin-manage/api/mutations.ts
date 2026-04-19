"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addPlatformAdmin } from "@/entities/platform-admin";
import { useAdminCapabilities } from "@/entities/session";
import {
  addOrgAdmin,
  orgAdminKeys,
  removeOrgAdmin,
} from "@/entities/org-admin";
import { ApiError } from "@/shared/api";

/**
 * Adding a user to `orgs_admins` requires them to already hold the
 * `admin` base role (FK on `orgs_admins.admin_id` → `users_roles`).
 * Pure org-admins can't grant that role (it's platform-scope), so they
 * get a raw 404/409 from the backend if they try to promote someone
 * who isn't yet an admin.
 *
 * Platform admins CAN grant it. When the caller holds the platform
 * capability, we opportunistically elevate the target first, tolerating
 * the 409 that comes back if they're already an admin, then proceed
 * with the org-admin insert. Non-platform callers skip the elevation
 * step entirely — their experience is unchanged.
 */
export function useAddOrgAdminMutation(orgId: string) {
  const queryClient = useQueryClient();
  const caps = useAdminCapabilities();

  return useMutation({
    mutationKey: ["admin-org-admin", "add", orgId],
    mutationFn: async (userId: string) => {
      if (caps.platform) {
        try {
          await addPlatformAdmin(userId);
        } catch (err) {
          // 409 = already holds the admin role → expected, continue.
          if (!(err instanceof ApiError) || err.status !== 409) {
            throw err;
          }
        }
      }
      await addOrgAdmin(orgId, userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orgAdminKeys.listByOrg(orgId),
      });
    },
  });
}

export function useRemoveOrgAdminMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-org-admin", "remove", orgId],
    mutationFn: (userId: string) => removeOrgAdmin(orgId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orgAdminKeys.listByOrg(orgId),
      });
    },
  });
}
