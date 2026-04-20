"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  HeartPulse,
  Loader2,
  Pill,
  Ruler,
  Scale,
  StickyNote,
  User2,
} from "lucide-react";
import type { ReactNode } from "react";

import { patientHealthByApptQuery } from "@/entities/patient-health";

interface PatientHealthSnapshotProps {
  doctorDepartmentId: string;
  appointmentId: string;
}

/**
 * Doctor-facing read-only view of the patient's saved health profile,
 * rendered inside the clinical section of the appointment card.
 * Allergies + chronic conditions are shown as warnings at the top so
 * a doctor writing a prescription can't miss them.
 */
export function PatientHealthSnapshot({
  doctorDepartmentId,
  appointmentId,
}: PatientHealthSnapshotProps) {
  const query = useQuery(
    patientHealthByApptQuery(doctorDepartmentId, appointmentId),
  );

  if (query.isPending) {
    return (
      <section className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading patient profile…
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className="text-destructive text-sm">
        Could not load patient health profile.
      </section>
    );
  }

  const p = query.data;
  if (!p) {
    return (
      <section className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <User2 className="size-3.5" aria-hidden />
        Patient hasn&apos;t filled in their health profile yet.
      </section>
    );
  }

  const hasAllergies = p.allergies.trim().length > 0;
  const hasChronic = p.chronicConditions.trim().length > 0;
  const hasMeds = p.currentMedications.trim().length > 0;
  const hasAnyAlert = hasAllergies || hasChronic;
  const hasVitals =
    p.bloodType.trim().length > 0 || p.heightCm !== null || p.weightKg !== null;
  const hasEmergency =
    p.emergencyContactName.trim().length > 0 ||
    p.emergencyContactPhone.trim().length > 0;

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <HeartPulse className="size-4 text-primary" aria-hidden />
          Patient profile
        </h4>
        <span className="text-muted-foreground text-[11px]">
          Updated {formatWhen(p.updatedAt)}
        </span>
      </header>

      {hasAnyAlert ? (
        <div className="rounded-lg border border-amber-400/60 bg-amber-50 px-3 py-2 text-sm">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <AlertTriangle className="size-3.5" aria-hidden />
            Flags
          </p>
          <div className="space-y-1 text-sm text-amber-900">
            {hasAllergies ? (
              <AlertRow label="Allergies" value={p.allergies} />
            ) : null}
            {hasChronic ? (
              <AlertRow label="Chronic" value={p.chronicConditions} />
            ) : null}
          </div>
        </div>
      ) : null}

      <dl className="grid gap-2 rounded-lg border bg-background/70 px-3 py-2.5 text-sm sm:grid-cols-2">
        {hasVitals ? (
          <Field
            icon={<HeartPulse className="size-3.5" aria-hidden />}
            label="Vitals"
            value={vitalsSummary(p.bloodType, p.heightCm, p.weightKg)}
          />
        ) : null}
        {hasMeds ? (
          <Field
            icon={<Pill className="size-3.5" aria-hidden />}
            label="Current meds"
            value={p.currentMedications}
            full
          />
        ) : null}
        {hasEmergency ? (
          <Field
            icon={<User2 className="size-3.5" aria-hidden />}
            label="Emergency"
            value={
              [p.emergencyContactName, p.emergencyContactPhone]
                .filter(Boolean)
                .join(" · ") || "—"
            }
            full
          />
        ) : null}
        {p.notes.trim() ? (
          <Field
            icon={<StickyNote className="size-3.5" aria-hidden />}
            label="Notes"
            value={p.notes}
            full
          />
        ) : null}
        {!hasVitals && !hasMeds && !hasEmergency && !p.notes.trim() ? (
          <p className="text-muted-foreground text-xs italic">
            No additional fields filled in.
          </p>
        ) : null}
      </dl>
    </section>
  );
}

function AlertRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex gap-2 text-sm">
      <span className="shrink-0 font-semibold">{label}:</span>
      <span className="whitespace-pre-wrap">{value}</span>
    </p>
  );
}

function Field({
  icon,
  label,
  value,
  full = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function vitalsSummary(
  bloodType: string,
  heightCm: number | null,
  weightKg: number | null,
): string {
  const bits: string[] = [];
  if (bloodType.trim()) bits.push(bloodType.trim());
  if (heightCm !== null) bits.push(`${heightCm} cm`);
  if (weightKg !== null) bits.push(`${weightKg} kg`);
  return bits.join(" · ") || "—";
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}
