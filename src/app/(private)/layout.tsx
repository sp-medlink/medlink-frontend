import type { ReactNode } from "react";
import { RequireAuth } from "@/entities/session";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
