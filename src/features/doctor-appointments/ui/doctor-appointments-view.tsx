"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Loader2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  appointmentKeys,
  fetchDoctorAppointments,
  fetchVideoCallTokenForDoctorAppointment,
  setDoctorAppointmentOnSchedule,
} from "@/entities/appointment";
import { myDoctorDepartmentsOptions, myDoctorProfileOptions } from "@/entities/doctor";
import { ApiError } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { MedlinkVideoRoom } from "@/shared/ui/medlink-video-room";

interface DoctorAppointmentsViewProps {
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

export function DoctorAppointmentsView({ embedded = false }: DoctorAppointmentsViewProps) {
  const qc = useQueryClient();
  const profile = useQuery(myDoctorProfileOptions());
  const depts = useQuery(myDoctorDepartmentsOptions());
  const showHeader = !embedded;
  const [docDeptId, setDocDeptId] = useState<string | null>(null);
  const appts = useQuery({
    queryKey: [...appointmentKeys.list(), "doctor", docDeptId ?? ""],
    queryFn: () => fetchDoctorAppointments(docDeptId!),
    enabled: Boolean(docDeptId),
  });

  const [session, setSession] = useState<{ url: string; token: string } | null>(
    null,
  );
  const [joiningApptId, setJoiningApptId] = useState<string | null>(null);

  const toggle = useMutation({
    mutationFn: (p: { apptId: string; on: boolean }) =>
      setDoctorAppointmentOnSchedule(docDeptId!, p.apptId, p.on),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: appointmentKeys.all() });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Error");
    },
  });

  const join = useMutation({
    mutationFn: async (apptId: string) => {
      setJoiningApptId(apptId);
      return fetchVideoCallTokenForDoctorAppointment(docDeptId!, apptId);
    },
    onSuccess: (data) => setSession({ url: data.url, token: data.token }),
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Video error");
    },
    onSettled: () => {
      setJoiningApptId(null);
    },
  });

  useEffect(() => {
    if (docDeptId) return;
    const first = (depts.data ?? []).find((d) => d.isActive) ?? depts.data?.[0];
    if (first) setDocDeptId(first.id);
  }, [docDeptId, depts.data]);

  const verified =
    profile.data?.verificationStatus === "approved";
  const deptAppointments = appts.data ?? [];
  const onlineCount = deptAppointments.filter((a) => a.isOnline).length;
  const onScheduleCount = deptAppointments.filter((a) => a.isOnSchedule).length;

  return (
    <main
      className={cn(
        "mx-auto flex w-full flex-col gap-6",
        embedded ? "max-w-none p-4 sm:p-5" : "min-h-screen max-w-6xl p-6",
      )}
    >
      {showHeader ? (
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Appointments</h1>
          {!verified ? (
            <p className="rounded-xl border border-amber-400/40 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              Video is available after your doctor verification is approved.
            </p>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage on-schedule status and video for online appointments.
            </p>
          )}
        </header>
      ) : (
        !verified && (
          <p className="rounded-xl border border-amber-400/40 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            Video is available after verification approval.
          </p>
        )
      )}

      {session ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Video</CardTitle>
            <Button type="button" variant="outline" onClick={() => setSession(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <MedlinkVideoRoom
              serverUrl={session.url}
              token={session.token}
              onDisconnected={() => setSession(null)}
              participantRole="doctor"
            />
          </CardContent>
        </Card>
      ) : null}

      {depts.isPending ? (
        <div className="flex min-h-[100px] items-center justify-center rounded-2xl border">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : null}

      {docDeptId ? (
        appts.isPending ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border">
            <Loader2 className="size-8 animate-spin" />
          </div>
        ) : deptAppointments.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-xl">No appointments in this department</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Choose another department or wait until patients book a visit.
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Total</p>
                  <p className="mt-1 text-2xl font-semibold">{deptAppointments.length}</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Online</p>
                  <p className="mt-1 text-2xl font-semibold">{onlineCount}</p>
                </CardContent>
              </Card>
              <Card className="border-violet-500/20 bg-violet-500/5">
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    On schedule
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{onScheduleCount}</p>
                </CardContent>
              </Card>
            </section>

            <ul className="grid gap-3 md:grid-cols-2">
            {deptAppointments.map((a) => (
              <li
                key={a.id}
                className={cn(
                  "rounded-2xl border bg-card/95 p-4 shadow-sm transition hover:shadow-md",
                  !a.isEnabled && "opacity-60",
                )}
              >
                <div className="mb-3 flex flex-wrap justify-between gap-2">
                  <p className="flex items-center gap-2 text-base font-semibold">
                    <CalendarDays className="text-primary size-4" />
                    {formatDate(a.date)} at {formatTime(a.time)}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant={a.isOnSchedule ? "default" : "secondary"}>
                      {a.isOnSchedule ? "On schedule" : "Off schedule"}
                    </Badge>
                    <Badge variant="outline">{a.isOnline ? "Online" : "In person"}</Badge>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={toggle.isPending && toggle.variables?.apptId === a.id}
                    onClick={() =>
                      toggle.mutate({ apptId: a.id, on: !a.isOnSchedule })
                    }
                  >
                    {toggle.isPending && toggle.variables?.apptId === a.id ? (
                      <Loader2 className="mr-1 size-4 animate-spin" />
                    ) : null}
                    {a.isOnSchedule ? "Remove from schedule" : "Add to schedule"}
                  </Button>
                  {a.isOnline && verified ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => join.mutate(a.id)}
                      disabled={join.isPending}
                    >
                      {join.isPending && joiningApptId === a.id ? (
                        <Loader2 className="mr-1 size-4 animate-spin" />
                      ) : (
                        <Video className="mr-1 size-4" />
                      )}
                      {join.isPending && joiningApptId === a.id ? "Connecting..." : "Video"}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
            </ul>
          </>
        )
      ) : null}
    </main>
  );
}
