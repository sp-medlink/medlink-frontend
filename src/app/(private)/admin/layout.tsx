import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RequireRole } from "@/entities/session";

export const metadata: Metadata = {
  title: { default: "Admin · Medlink", template: "%s · Admin · Medlink" },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequireRole role="admin">{children}</RequireRole>;
}
