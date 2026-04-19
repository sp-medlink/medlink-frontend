import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RequireAnyAdmin } from "@/entities/session";

export const metadata: Metadata = {
  title: { default: "Admin · Medlink", template: "%s · Admin · Medlink" },
};

/**
 * `/admin` is the single unified admin surface for platform, organization,
 * and department admins alike. `RequireAnyAdmin` grants access if the user
 * holds any admin capability; the page itself adapts to what they can
 * actually administer.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequireAnyAdmin>{children}</RequireAnyAdmin>;
}
