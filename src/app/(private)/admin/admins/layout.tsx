import type { ReactNode } from "react";

import { RequirePlatformAdmin } from "@/entities/session";

export default function AdminAdminsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequirePlatformAdmin>{children}</RequirePlatformAdmin>;
}
