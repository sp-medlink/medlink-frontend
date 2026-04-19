import type { ReactNode } from "react";

import { RequirePlatformAdmin } from "@/entities/session";

/**
 * `/admin/users` is platform-admin only. Org-admins should not see
 * every registered user on Medlink — that's operator oversight, not a
 * tenant concern.
 */
export default function AdminUsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequirePlatformAdmin>{children}</RequirePlatformAdmin>;
}
