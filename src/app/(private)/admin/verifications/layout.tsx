import type { ReactNode } from "react";

import { RequirePlatformAdmin } from "@/entities/session";

/**
 * `/admin/verifications` is platform-admin only. Doctor identity and
 * licensing review is a Medlink-operator responsibility — tenants
 * don't gate their own doctors' platform trust.
 */
export default function AdminVerificationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequirePlatformAdmin>{children}</RequirePlatformAdmin>;
}
