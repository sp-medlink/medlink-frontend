import type { ReactNode } from "react";
import { RedirectIfAuthenticated } from "@/entities/session";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <RedirectIfAuthenticated>
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </RedirectIfAuthenticated>
  );
}
