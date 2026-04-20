import type { ReactNode } from "react";

import { RequirePlatformAdmin } from "@/entities/session";

/**
 * `/admin/audit` is platform-admin only. The audit log surfaces every
 * privileged action across tenants and is operator oversight territory.
 */
export default function AdminAuditLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequirePlatformAdmin>{children}</RequirePlatformAdmin>;
}
