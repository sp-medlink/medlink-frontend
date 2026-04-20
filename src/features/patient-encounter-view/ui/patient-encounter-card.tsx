"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, NotebookText } from "lucide-react";

import type { AppointmentStatus } from "@/entities/appointment";
import { myEncounterQuery } from "@/entities/encounter";

interface PatientEncounterCardProps {
  appointmentId: string;
  appointmentStatus: AppointmentStatus;
}

/**
 * Read-only encounter view for the patient. Only surfaces once the
 * appointment reaches `completed` — anything earlier means the doctor
 * is still in the middle of the visit and the notes aren't finalised.
 */
export function PatientEncounterCard({
  appointmentId,
  appointmentStatus,
}: PatientEncounterCardProps) {
  const query = useQuery({
    ...myEncounterQuery(appointmentId),
    enabled: appointmentStatus === "completed",
  });

  if (appointmentStatus !== "completed") return null;
  if (query.isPending) {
    return (
      <div className="flex items-center gap-2 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading encounter…
      </div>
    );
  }
  if (query.isError || !query.data) return null;

  const { note, diagnosis, followUp } = query.data;
  const hasAny = note || diagnosis || followUp;
  if (!hasAny) return null;

  return (
    <div className="rounded-xl border bg-card/80 p-4">
      <div className="mb-3 flex items-center gap-1.5 font-medium">
        <NotebookText className="size-4 text-primary" aria-hidden />
        Doctor&apos;s notes
      </div>
      <dl className="grid gap-3 text-sm">
        {note ? (
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Note
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap">{note}</dd>
          </div>
        ) : null}
        {diagnosis ? (
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Diagnosis
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap">{diagnosis}</dd>
          </div>
        ) : null}
        {followUp ? (
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Follow-up
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap">{followUp}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
