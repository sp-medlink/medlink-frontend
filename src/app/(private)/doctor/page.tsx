"use client";

import { useCurrentUser } from "@/entities/session";
import { LogoutButton } from "@/features/auth-logout";

export default function DoctorHomePage() {
  const user = useCurrentUser();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Doctor area</h1>
      <p className="text-muted-foreground text-sm">
        Hello, Dr. {user?.lastName ?? ""}. Feature slices will render here.
      </p>
      <LogoutButton />
    </main>
  );
}
