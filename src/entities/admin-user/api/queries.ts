import { queryOptions } from "@tanstack/react-query";

import { fetchAdminUser, fetchAdminUsers } from "./users.api";
import { adminUserKeys } from "./keys";

export const adminUsersQuery = () =>
  queryOptions({
    queryKey: adminUserKeys.list(),
    queryFn: fetchAdminUsers,
    staleTime: 30_000,
  });

export const adminUserDetailQuery = (userId: string) =>
  queryOptions({
    queryKey: adminUserKeys.detail(userId),
    queryFn: () => fetchAdminUser(userId),
    staleTime: 30_000,
    enabled: !!userId,
  });
