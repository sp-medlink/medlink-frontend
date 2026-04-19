"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createOrganization,
  createOrganizationAsPlatformAdmin,
  deleteOrganization,
  organizationKeys,
  setOrganizationActive,
  updateOrganization,
  type OrganizationMutateBody,
  type PlatformCreateOrganizationBody,
} from "@/entities/organization";

function invalidateOrgLists(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: organizationKeys.listOrgAdmin(),
  });
  void queryClient.invalidateQueries({
    queryKey: organizationKeys.listPlatform(),
  });
}

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-organization", "create"],
    mutationFn: (body: OrganizationMutateBody) => createOrganization(body),
    onSuccess: () => invalidateOrgLists(queryClient),
  });
}

/**
 * Platform-admin variant. Backed by `POST /user/admin/organizations`.
 * The caller (Medlink operator) stays out of `orgs_admins`; the target
 * user in `initial_admin_user_id` becomes the org's first admin and is
 * auto-elevated to the `admin` base role if needed.
 */
export function useCreateOrganizationAsPlatformAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-organization", "create", "platform"],
    mutationFn: (body: PlatformCreateOrganizationBody) =>
      createOrganizationAsPlatformAdmin(body),
    onSuccess: () => invalidateOrgLists(queryClient),
  });
}

export function useUpdateOrganizationMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-organization", "update", orgId],
    mutationFn: (body: OrganizationMutateBody) =>
      updateOrganization(orgId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(orgId),
      });
      invalidateOrgLists(queryClient);
    },
  });
}

export function useDeleteOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-organization", "delete"],
    mutationFn: (orgId: string) => deleteOrganization(orgId),
    onSuccess: (_, orgId) => {
      queryClient.removeQueries({ queryKey: organizationKeys.detail(orgId) });
      invalidateOrgLists(queryClient);
    },
  });
}

export function useSetOrganizationActiveMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-organization", "toggle-active", orgId],
    mutationFn: (isActive: boolean) => setOrganizationActive(orgId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(orgId),
      });
      invalidateOrgLists(queryClient);
    },
  });
}
