"use client";

import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Loader2,
  Search,
  Stethoscope,
  User2,
} from "lucide-react";

import {
  appointmentKeys,
  fetchDoctorAppointments,
  isTerminalStatus,
} from "@/entities/appointment";
import type { Appointment } from "@/entities/appointment";
import { myDoctorDepartmentsOptions } from "@/entities/doctor";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

interface PatientRow {
  userId: string;
  firstName: string;
  lastName: string;
  avatarPath: string;
  visitCount: number;
  upcomingCount: number;
  lastVisitMs: number | null;
  lastVisitAppt: Appointment | null;
}

function parseApptTime(a: Appointment): number | null {
  const d = a.date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!d) return null;
  const t = a.time.match(/T(\d{2}):(\d{2})|^(\d{2}):(\d{2})/);
  const hh = t ? Number(t[1] ?? t[3]) : 0;
  const mm = t ? Number(t[2] ?? t[4]) : 0;
  return new Date(
    Number(d[1]),
    Number(d[2]) - 1,
    Number(d[3]),
    hh,
    mm,
  ).getTime();
}

function displayName(first: string, last: string): string {
  const name = `${first} ${last}`.trim();
  return name || "Unknown patient";
}

function initials(first: string, last: string): string {
  const a = first.trim()[0] ?? "";
  const b = last.trim()[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function formatWhen(ms: number): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(ms));
}

/**
 * Patient-centric view over the doctor's appointments. The backend
 * has no dedicated "patients I've seen" endpoint, so we derive the
 * list client-side: fan out one appointments query per department the
 * doctor owns, flatten, dedupe by patient userId, and summarise.
 *
 * That's fine for the scale we're at (a doctor has a handful of
 * depts, each with tens–hundreds of appts). If it ever grows, the
 * right fix is a backend `/user/doctor/patients` endpoint with real
 * pagination and filter support.
 */
export function DoctorPatientsView() {
  const depts = useQuery(myDoctorDepartmentsOptions());
  const deptIds = useMemo(
    () => (depts.data ?? []).map((d) => d.id),
    [depts.data],
  );

  const apptQueries = useQueries({
    queries: deptIds.map((deptId) => ({
      queryKey: [...appointmentKeys.list(), "doctor-patients", deptId],
      queryFn: () => fetchDoctorAppointments(deptId),
      staleTime: 60_000,
    })),
  });

  const loading =
    depts.isPending || apptQueries.some((q) => q.isPending && q.fetchStatus !== "idle");
  const errored = apptQueries.some((q) => q.isError);

  const allAppts = useMemo(
    () => apptQueries.flatMap((q) => q.data ?? []),
    [apptQueries],
  );

  const patients = useMemo<PatientRow[]>(() => {
    const byId = new Map<string, PatientRow>();
    for (const a of allAppts) {
      if (!a.userId) continue;
      const ts = parseApptTime(a) ?? 0;
      const upcoming =
        !isTerminalStatus(a.status) &&
        a.isEnabled &&
        ts >= Date.now();
      const existing = byId.get(a.userId);
      if (!existing) {
        byId.set(a.userId, {
          userId: a.userId,
          firstName: a.patientFirstName,
          lastName: a.patientLastName,
          avatarPath: a.patientAvatarPath,
          visitCount: 1,
          upcomingCount: upcoming ? 1 : 0,
          lastVisitMs: ts,
          lastVisitAppt: a,
        });
      } else {
        existing.visitCount += 1;
        if (upcoming) existing.upcomingCount += 1;
        if (ts > (existing.lastVisitMs ?? 0)) {
          existing.lastVisitMs = ts;
          existing.lastVisitAppt = a;
        }
        // Prefer the most complete name we've seen.
        if (!existing.firstName && a.patientFirstName) {
          existing.firstName = a.patientFirstName;
        }
        if (!existing.lastName && a.patientLastName) {
          existing.lastName = a.patientLastName;
        }
        if (!existing.avatarPath && a.patientAvatarPath) {
          existing.avatarPath = a.patientAvatarPath;
        }
      }
    }
    return Array.from(byId.values()).sort(
      (a, b) => (b.lastVisitMs ?? 0) - (a.lastVisitMs ?? 0),
    );
  }, [allAppts]);

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return patients;
    return patients.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(needle) ||
      p.userId.toLowerCase().includes(needle),
    );
  }, [patients, q]);

  const hasNoDepts = !loading && deptIds.length === 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Patients
        </h1>
        <p className="text-muted-foreground text-sm">
          Everyone you&apos;ve had an appointment with, aggregated across
          your departments.
        </p>
      </header>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search by name or user ID"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {hasNoDepts ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No departments</CardTitle>
            <CardDescription>
              Join a department first — patients show up once you have
              visits booked.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading patients…
        </div>
      ) : errored ? (
        <p className="text-destructive text-sm">
          Some appointments failed to load. Results may be incomplete.
        </p>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">
              {q.trim() ? "No matches" : "No patients yet"}
            </CardTitle>
            <CardDescription>
              {q.trim()
                ? "Try a different name or ID."
                : "Once a patient books a visit in one of your departments, they'll appear here."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {filtered.map((p) => (
            <li key={p.userId}>
              <Card className="shadow-sm">
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <Avatar className="size-11 shrink-0 border">
                    <AvatarImage src={p.avatarPath || undefined} alt="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {initials(p.firstName, p.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-base font-semibold">
                      <User2
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      {displayName(p.firstName, p.lastName)}
                    </p>
                    <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Stethoscope className="size-3" aria-hidden />
                        {p.visitCount} visit{p.visitCount === 1 ? "" : "s"}
                      </span>
                      {p.lastVisitMs ? (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3" aria-hidden />
                          Last on {formatWhen(p.lastVisitMs)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {p.upcomingCount > 0 ? (
                    <Badge>
                      {p.upcomingCount} upcoming
                    </Badge>
                  ) : (
                    <Badge variant="outline">Past only</Badge>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
