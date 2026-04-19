import type { ReactNode } from "react";
import { RequireAuth } from "@/entities/session";
import { PrivateAppShell } from "@/features/app-sidebar";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <PrivateAppShell>{children}</PrivateAppShell>
    </RequireAuth>
  );
}
