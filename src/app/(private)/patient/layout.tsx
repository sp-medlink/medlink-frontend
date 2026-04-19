import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RequireRole } from "@/entities/session";

export const metadata: Metadata = {
  title: { default: "Patient · Medlink", template: "%s · Patient · Medlink" },
};

export default function PatientLayout({ children }: { children: ReactNode }) {
  return <RequireRole role="user">{children}</RequireRole>;
}
