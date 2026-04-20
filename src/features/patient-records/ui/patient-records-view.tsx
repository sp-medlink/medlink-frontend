"use client";

import { PatientHealthForm } from "@/features/patient-health-edit";
import { PrescriptionsHistoryCard } from "@/features/patient-prescriptions-view";

export function PatientRecordsView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Medical record
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Keep your health profile up to date so doctors see an accurate
          picture at every visit. Prescriptions from completed visits appear
          below.
        </p>
      </header>

      <PatientHealthForm />
      <PrescriptionsHistoryCard />
    </main>
  );
}
