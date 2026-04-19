"use client";

import { useCurrentUser } from "@/entities/session";

export default function PatientHomePage() {
  const user = useCurrentUser();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Patient area</h1>
      <p className="text-muted-foreground text-sm">
        Hello, {user?.firstName ?? "patient"}. Feature slices will render here.
      </p>
    </main>
  );
}
