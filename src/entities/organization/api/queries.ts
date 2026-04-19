import { queryOptions } from "@tanstack/react-query";

import { fetchOrganization, fetchOrganizations } from "./organizations.api";
import { organizationKeys } from "./keys";

export const organizationsListOrgAdminQuery = () =>
  queryOptions({
    queryKey: organizationKeys.listOrgAdmin(),
    queryFn: () => fetchOrganizations("org-admin"),
    staleTime: 30_000,
  });

export const organizationsListPlatformQuery = () =>
  queryOptions({
    queryKey: organizationKeys.listPlatform(),
    queryFn: () => fetchOrganizations("platform"),
    staleTime: 30_000,
  });

export const organizationDetailQuery = (orgId: string) =>
  queryOptions({
    queryKey: organizationKeys.detail(orgId),
    queryFn: () => fetchOrganization(orgId),
    staleTime: 30_000,
    enabled: !!orgId,
  });
