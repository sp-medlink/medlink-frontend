import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RequireRole } from "@/entities/session";

export const metadata: Metadata = {
  title: {
    default: "Department admin · Medlink",
    template: "%s · Department admin · Medlink",
  },
};

export default function DeptAdminLayout({ children }: { children: ReactNode }) {
  return <RequireRole role="doctor">{children}</RequireRole>;
}
