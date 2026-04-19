import { queryOptions } from "@tanstack/react-query";

import { fetchOrgAdmins } from "./org-admins.api";
import { orgAdminKeys } from "./keys";

export const orgAdminsQuery = (orgId: string) =>
  queryOptions({
    queryKey: orgAdminKeys.listByOrg(orgId),
    queryFn: () => fetchOrgAdmins(orgId),
    staleTime: 30_000,
    enabled: !!orgId,
  });
