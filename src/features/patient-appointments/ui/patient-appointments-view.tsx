"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Calendar, Loader2, Sparkles, Video } from "lucide-react";
import Link from "next/link";

import {
  appointmentsListOptions,
  isTerminalStatus,
} from "@/entities/appointment";
import { CancelAppointmentDialog } from "@/features/patient-appointment-cancel";
import { PatientEncounterCard } from "@/features/patient-encounter-view";
import { PrescriptionsByAppointmentCard } from "@/features/patient-prescriptions-view";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { AppointmentStatusBadge } from "@/shared/ui/appointment-status-badge";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface PatientAppointmentsViewProps {
  embedded?: boolean;
}

function formatDate(value: string): string {
  const raw = value.trim();
  const isoDateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = isoDateMatch
    ? new Date(
        Date.UTC(
          Number(isoDateMatch[1]),
          Number(isoDateMatch[2]) - 1,
          Number(isoDateMatch[3]),
        ),
      )
    : new Date(raw);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatTime(value: string): string {
  const raw = value.trim();
  const isoTimeMatch = raw.match(/T(\d{2}):(\d{2})(?::\d{2})?/);
  if (isoTimeMatch) return `${isoTimeMatch[1]}:${isoTimeMatch[2]}`;

  const plainTimeMatch = raw.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (plainTimeMatch) return `${plainTimeMatch[1]}:${plainTimeMatch[2]}`;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(d);
}

export function PatientAppointmentsView({ embedded = false }: PatientAppointmentsViewProps) {
  const q = useQuery(appointmentsListOptions());
  const list = q.data ?? [];
  const showHeader = !embedded;
  const readyOnlineCount = list.filter((a) => a.isOnline && a.isOnSchedule && a.isEnabled).length;
  const confirmedCount = list.filter((a) => a.isOnSchedule && a.isEnabled).length;

  return (
    <main
      className={cn(
        "mx-auto flex w-full flex-col gap-6",
        embedded ? "max-w-none p-4 sm:p-5" : "min-h-screen max-w-6xl p-6",
      )}
    >
      {showHeader ? (
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            My appointments
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm sm:text-base">
            Online visits are available in{" "}
            <Link
              href={routes.patient.consultations}
              className="text-primary font-medium underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
            >
              Video consultations
            </Link>
            .
          </p>
        </header>
      ) : null}

      {q.isPending ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : q.isError ? (
        <p className="text-destructive rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          Could not load appointments.
        </p>
      ) : list.length === 0 ? (
        <Card className="relative overflow-hidden border-dashed bg-card/95 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <div className="pointer-events-none absolute -top-16 right-0 size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 size-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <CardHeader className="relative items-center pb-3 text-center">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium">
              <Sparkles className="text-primary size-3.5" aria-hidden />
              Your booking space is ready
            </div>
            <div className="bg-muted/80 mb-4 flex size-16 items-center justify-center rounded-2xl border shadow-inner">
              <Calendar className="text-muted-foreground size-8" aria-hidden />
            </div>
            <CardTitle className="text-3xl tracking-tight">No appointments yet</CardTitle>
            <CardDescription className="max-w-2xl text-balance text-base leading-relaxed">
              When you book with a doctor, visits will appear here. You can pick
              an organization and department in the directory or go to video
              visits.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-col items-center gap-6 pt-0">
            <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border bg-background/75 px-3 py-2 text-sm">
                <Building2 className="text-primary size-4" aria-hidden />
                <span>Find organization and department</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-background/75 px-3 py-2 text-sm">
                <Video className="text-primary size-4" aria-hidden />
                <span>Join online visits when confirmed</span>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="group min-w-[220px]" asChild>
              <Link href={routes.patient.organisations}>
                Organization directory
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[220px]" asChild>
              <Link href={routes.patient.consultations}>
                Video consultations
              </Link>
            </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Total</p>
                <p className="mt-1 text-2xl font-semibold">{list.length}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Confirmed</p>
                <p className="mt-1 text-2xl font-semibold">{confirmedCount}</p>
              </CardContent>
            </Card>
            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Ready for video</p>
                <p className="mt-1 text-2xl font-semibold">{readyOnlineCount}</p>
              </CardContent>
            </Card>
          </section>

          <ul className="grid gap-3 md:grid-cols-2">
          {list.map((a) => {
            const terminal = isTerminalStatus(a.status);
            return (
              <li
                key={a.id}
                className={cn(
                  "rounded-2xl border bg-card/90 p-4 shadow-sm transition hover:shadow-md",
                  !a.isEnabled && "opacity-60 saturate-50",
                  terminal && "opacity-80",
                )}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <p className="text-base font-semibold">
                    Dr. {a.doctorFirstName} {a.doctorLastName}
                  </p>
                  <div className="flex gap-2">
                    <AppointmentStatusBadge
                      status={a.status}
                      detail={a.cancellationReason || undefined}
                    />
                    <Badge variant="outline">{a.isOnline ? "Online" : "In person"}</Badge>
                  </div>
                </div>
                <div className="bg-muted/40 space-y-1 rounded-xl border px-3 py-2 text-sm">
                  <p className="font-medium">{a.departmentName}</p>
                  <p className="text-muted-foreground">
                    {formatDate(a.date)} at {formatTime(a.time)}
                  </p>
                  {a.cancellationReason ? (
                    <p className="text-destructive text-xs">
                      <span className="font-medium">Reason:</span> {a.cancellationReason}
                    </p>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.isOnline && a.status === "confirmed" ? (
                    <Button asChild size="sm">
                      <Link href={routes.patient.consultations}>Open video</Link>
                    </Button>
                  ) : null}
                  {!terminal ? (
                    <CancelAppointmentDialog appointmentId={a.id} />
                  ) : null}
                </div>
                {a.status === "completed" ? (
                  <div className="mt-4 grid gap-3">
                    <PatientEncounterCard
                      appointmentId={a.id}
                      appointmentStatus={a.status}
                    />
                    <PrescriptionsByAppointmentCard appointmentId={a.id} />
                  </div>
                ) : null}
              </li>
            );
          })}
          </ul>
        </>
      )}
    </main>
  );
}
