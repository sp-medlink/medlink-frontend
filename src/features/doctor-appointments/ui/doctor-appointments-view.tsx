"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, Loader2, User, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  appointmentKeys,
  computeVcWindow,
  fetchDoctorAppointments,
  fetchVideoCallTokenForDoctorAppointment,
  formatVCJoinError,
  formatVcWindowHint,
  isTerminalStatus,
  setDoctorAppointmentOnSchedule,
} from "@/entities/appointment";
import { myDoctorDepartmentsOptions, myDoctorProfileOptions } from "@/entities/doctor";
import { LifecycleControls } from "@/features/doctor-appointment-lifecycle";
import { EncounterEditor } from "@/features/doctor-encounter-edit";
import { PatientHealthSnapshot } from "@/features/doctor-patient-health-view";
import { PrescriptionPanel } from "@/features/doctor-prescription-crud";
import { ApiError } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { AppointmentStatusBadge } from "@/shared/ui/appointment-status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { MedlinkVideoRoom } from "@/shared/ui/medlink-video-room";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

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

/**
 * "Past" means the appointment's calendar date is strictly before today.
 * Today's appointments stay in "Upcoming" even if the clock time has
 * already slipped past — the doctor still needs to resolve them.
 */
function isApptPast(dateStr: string): boolean {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return false;
  const target = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
  ).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target < today.getTime();
}

function patientDisplayName(first: string, last: string): string {
  const name = `${first} ${last}`.trim();
  return name || "Unknown patient";
}

function patientInitials(first: string, last: string): string {
  const a = first.trim()[0] ?? "";
  const b = last.trim()[0] ?? "";
  const initials = `${a}${b}`.toUpperCase();
  return initials || "?";
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
      toast.error(formatVCJoinError(e));
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

  const upcomingAppts = deptAppointments.filter((a) => !isApptPast(a.date));
  const pastAppts = deptAppointments.filter((a) => isApptPast(a.date));

  type Appt = (typeof deptAppointments)[number];

  /**
   * A single appointment card. `readOnly=true` strips the action
   * controls (lifecycle, schedule toggle, video) — used for the "Past"
   * tab, where those buttons would be misleading.
   */
  const renderCard = (a: Appt, readOnly: boolean) => {
    const clinical =
      docDeptId &&
      (a.status === "confirmed" ||
        a.status === "in_progress" ||
        a.status === "completed");
    const toggleBusy =
      toggle.isPending && toggle.variables?.apptId === a.id;
    const terminal = isTerminalStatus(a.status);
    const showLifecycle = !readOnly && docDeptId !== null;
    const showScheduleToggle = !readOnly && !terminal;
    const showVideo = !readOnly && a.isOnline && verified && !terminal;
    const showUtilityRow = showScheduleToggle || showVideo;
    const vcWindow = showVideo ? computeVcWindow(a) : null;
    const vcHint = vcWindow ? formatVcWindowHint(vcWindow) : "";
    const vcCanJoin = vcWindow?.phase === "open";
    return (
      <li
        key={a.id}
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border bg-card/95 shadow-sm transition hover:shadow-md",
          !a.isEnabled && "opacity-60",
          readOnly && "opacity-90",
        )}
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <Avatar className="size-11 shrink-0 border">
              <AvatarImage
                src={a.patientAvatarPath || undefined}
                alt=""
              />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {patientInitials(a.patientFirstName, a.patientLastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                <User className="size-3" aria-hidden />
                Patient
              </p>
              <p className="truncate text-base font-semibold leading-tight">
                {patientDisplayName(a.patientFirstName, a.patientLastName)}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {formatDate(a.date)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" aria-hidden />
                  {formatTime(a.time)}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <AppointmentStatusBadge
                status={a.status}
                detail={a.cancellationReason || undefined}
              />
              <Badge variant="outline">
                {a.isOnline ? "Online" : "In person"}
              </Badge>
            </div>
          </div>

          {a.cancellationReason ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <span className="font-medium">Reason:</span>{" "}
              {a.cancellationReason}
            </p>
          ) : null}

          {showLifecycle ? (
            <LifecycleControls
              doctorDepartmentId={docDeptId!}
              appointmentId={a.id}
              currentStatus={a.status}
              appointmentDate={a.date}
              appointmentTime={a.time}
            />
          ) : null}

          {showUtilityRow ? (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              {showScheduleToggle ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toggle.mutate({ apptId: a.id, on: !a.isOnSchedule })
                  }
                  disabled={toggleBusy}
                  className={cn(
                    !a.isOnSchedule &&
                      "border-primary/40 text-primary hover:text-primary",
                  )}
                >
                  {toggleBusy ? (
                    <Loader2
                      className="mr-1.5 size-4 animate-spin"
                      aria-hidden
                    />
                  ) : null}
                  {a.isOnSchedule
                    ? "Remove from schedule"
                    : "Add to schedule"}
                </Button>
              ) : (
                <span />
              )}
              {showVideo ? (
                <div className="flex flex-col items-end gap-0.5">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => join.mutate(a.id)}
                    disabled={join.isPending || !vcCanJoin}
                    title={vcCanJoin ? undefined : vcHint}
                  >
                    {join.isPending && joiningApptId === a.id ? (
                      <Loader2
                        className="mr-1.5 size-4 animate-spin"
                        aria-hidden
                      />
                    ) : (
                      <Video className="mr-1.5 size-4" aria-hidden />
                    )}
                    {join.isPending && joiningApptId === a.id
                      ? "Connecting…"
                      : "Join video"}
                  </Button>
                  {vcHint ? (
                    <span
                      className={cn(
                        "text-[11px]",
                        vcCanJoin
                          ? "text-emerald-600"
                          : "text-muted-foreground",
                      )}
                    >
                      {vcHint}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {clinical ? (
          <div className="space-y-5 border-t bg-muted/30 px-5 py-4">
            <PatientHealthSnapshot
              doctorDepartmentId={docDeptId!}
              appointmentId={a.id}
            />
            <div className="border-t pt-4">
              <EncounterEditor
                doctorDepartmentId={docDeptId!}
                appointmentId={a.id}
                appointmentStatus={a.status}
              />
            </div>
            <div className="border-t pt-4">
              <PrescriptionPanel
                doctorDepartmentId={docDeptId!}
                appointmentId={a.id}
                appointmentStatus={a.status}
                patientName={patientDisplayName(
                  a.patientFirstName,
                  a.patientLastName,
                )}
              />
            </div>
          </div>
        ) : null}
      </li>
    );
  };

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

            <Tabs defaultValue="upcoming" className="gap-4">
              <TabsList>
                <TabsTrigger value="upcoming">
                  Upcoming
                  <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-[11px] font-medium text-primary">
                    {upcomingAppts.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
                    {pastAppts.length}
                  </span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                {upcomingAppts.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                      No upcoming appointments.
                    </CardContent>
                  </Card>
                ) : (
                  <ul className="grid gap-4 md:grid-cols-2">
                    {upcomingAppts.map((a) => renderCard(a, false))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="past">
                {pastAppts.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                      No past appointments yet.
                    </CardContent>
                  </Card>
                ) : (
                  <ul className="grid gap-4 md:grid-cols-2">
                    {pastAppts.map((a) => renderCard(a, true))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </>
        )
      ) : null}
    </main>
  );
}
