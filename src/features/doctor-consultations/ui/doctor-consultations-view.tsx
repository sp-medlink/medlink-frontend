"use client";

import Link from "next/link";

import { routes } from "@/shared/config";

/** Video calls live under Appointments; this page is a short navigation hint. */
export function DoctorConsultationsView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Video consultations
      </h1>
      <p className="text-muted-foreground text-sm">
        Join a call from the appointments list for online bookings.
      </p>
      <Link
        href={routes.doctor.appointments}
        className="text-emerald-600 text-sm font-medium underline"
      >
        Go to appointments
      </Link>
    </main>
  );
}
