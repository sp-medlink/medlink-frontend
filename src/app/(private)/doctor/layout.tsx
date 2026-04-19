import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RequireRole } from "@/entities/session";

export const metadata: Metadata = {
  title: { default: "Doctor · Medlink", template: "%s · Doctor · Medlink" },
};

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return <RequireRole role="doctor">{children}</RequireRole>;
}
