import type { ReactNode } from "react";

import { RequireOrgAdmin } from "@/entities/session";

/**
 * Gate for `/admin/organizations`. Platform admins pass implicitly
 * (see `useAdminCapabilities`: `anyOrg` is `true` for platform admins).
 * Org-admins also pass. Dept-admins without `orgs_admins` are bounced
 * back to `/admin` by the guard.
 */
export default function AdminOrganizationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequireOrgAdmin>{children}</RequireOrgAdmin>;
}
