import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Organization admin · Medlink",
    template: "%s · Organization admin · Medlink",
  },
};

export default function OrgAdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
