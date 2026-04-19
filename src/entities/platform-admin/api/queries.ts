import { queryOptions } from "@tanstack/react-query";

import { fetchPlatformAdmins } from "./platform-admins.api";
import { platformAdminKeys } from "./keys";

export const platformAdminsQuery = () =>
  queryOptions({
    queryKey: platformAdminKeys.list(),
    queryFn: fetchPlatformAdmins,
    staleTime: 30_000,
  });
