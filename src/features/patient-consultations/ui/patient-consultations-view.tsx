"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarCheck2,
  Loader2,
  Sparkles,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  appointmentsListOptions,
  fetchVideoCallTokenForAppointment,
} from "@/entities/appointment";
import { ApiError } from "@/shared/api";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { MedlinkVideoRoom } from "@/shared/ui/medlink-video-room";

interface PatientConsultationsViewProps {
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

export function PatientConsultationsView({ embedded = false }: PatientConsultationsViewProps) {
  const qc = useQueryClient();
  const list = useQuery(appointmentsListOptions());
  const showHeader = !embedded;
  const [session, setSession] = useState<{ url: string; token: string } | null>(
    null,
  );

  const join = useMutation({
    mutationFn: (appointmentId: string) =>
      fetchVideoCallTokenForAppointment(appointmentId),
    onSuccess: (data) => {
      setSession({ url: data.url, token: data.token });
    },
    onError: (e) => {
      const msg =
        e instanceof ApiError ? e.message : "Could not join the call";
      toast.error(msg);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["appointment"] });
    },
  });

  const online = (list.data ?? []).filter(
    (a) => a.isOnline && a.isEnabled && a.isOnSchedule,
  );

  return (
    <main
      className={cn(
        "mx-auto flex w-full flex-col gap-6",
        embedded ? "max-w-none p-4 sm:p-5" : "min-h-screen max-w-4xl p-6",
      )}
    >
      {showHeader ? (
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Video consultations
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Connect via LiveKit after a confirmed online appointment.
          </p>
        </header>
      ) : null}

      {session ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Call</CardTitle>
            <Button type="button" variant="outline" onClick={() => setSession(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <MedlinkVideoRoom
              serverUrl={session.url}
              token={session.token}
              onDisconnected={() => setSession(null)}
              participantRole="patient"
            />
          </CardContent>
        </Card>
      ) : null}

      {list.isPending ? (
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      ) : list.isError ? (
        <p className="text-destructive text-sm">
          Could not load appointments.
          {list.error instanceof ApiError && list.error.message
            ? ` ${list.error.message}`
            : null}
        </p>
      ) : online.length === 0 ? (
        <Card className="relative overflow-hidden border-dashed bg-card/95 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <div className="pointer-events-none absolute -top-16 right-0 size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-8 size-56 rounded-full bg-cyan-500/10 blur-3xl" />
          <CardHeader className="relative items-center pb-2 text-center">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium">
              <Sparkles className="text-primary size-3.5" aria-hidden />
              Ready when your appointment is confirmed
            </div>
            <div className="bg-muted/80 mb-4 flex size-16 items-center justify-center rounded-2xl border shadow-inner">
              <Video className="text-muted-foreground size-8" aria-hidden />
            </div>
            <CardTitle className="text-3xl tracking-tight">
              No video consultations yet
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-relaxed">
              You don&apos;t have a video call booking yet. Once your online visit
              is confirmed, it will appear here and you can join in one click.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-col items-center gap-6 pt-2">
            <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border bg-background/75 px-3 py-2 text-sm">
                <CalendarCheck2 className="text-primary size-4" aria-hidden />
                <span>Book an online appointment first</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-background/75 px-3 py-2 text-sm">
                <Video className="text-primary size-4" aria-hidden />
                <span>Join the call from this page</span>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="group min-w-[220px]" asChild>
                <Link href={routes.patient.appointments}>
                  My appointments
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[220px]" asChild>
                <Link href={routes.patient.organisations}>
                  Organization directory
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {online.map((a) => (
            <li key={a.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Dr. {a.doctorFirstName} {a.doctorLastName}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(a.date)} · {formatTime(a.time)} · {a.departmentName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    type="button"
                    disabled={join.isPending}
                    onClick={() => join.mutate(a.id)}
                  >
                    {join.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Join"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
