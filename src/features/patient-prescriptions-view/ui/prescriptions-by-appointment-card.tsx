"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Pill } from "lucide-react";

import { myPrescriptionsByAppointmentQuery } from "@/entities/prescription";

interface Props {
  appointmentId: string;
}

/** Read-only prescription list bound to a single appointment. */
export function PrescriptionsByAppointmentCard({ appointmentId }: Props) {
  const query = useQuery(myPrescriptionsByAppointmentQuery(appointmentId));

  if (query.isPending) {
    return (
      <div className="flex items-center gap-2 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading prescriptions…
      </div>
    );
  }
  if (query.isError) return null;
  const rows = query.data ?? [];
  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card/80 p-4">
      <div className="mb-3 flex items-center gap-1.5 font-medium">
        <Pill className="size-4 text-primary" aria-hidden />
        Prescriptions
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {rows.map((p) => (
          <li
            key={p.id}
            className="rounded-lg border bg-background/70 px-3 py-2"
          >
            <p className="font-medium">
              {p.drugName}
              {p.dose ? (
                <span className="text-muted-foreground"> · {p.dose}</span>
              ) : null}
            </p>
            <p className="text-muted-foreground text-xs">
              {[
                p.frequency,
                p.durationDays ? `${p.durationDays} days` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {p.notes ? (
              <p className="text-muted-foreground mt-0.5 text-xs italic">
                {p.notes}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
