"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Hospital,
  LayoutGrid,
  MessageSquare,
  Video,
} from "lucide-react";
import { useCurrentUser } from "@/entities/session";
import { appointmentsListOptions } from "@/entities/appointment";
import { fetchOrganizations } from "@/entities/doctor-directory";
import { PatientAppointmentsView } from "@/features/patient-appointments/ui/patient-appointments-view";
import { PatientConsultationsView } from "@/features/patient-consultations/ui/patient-consultations-view";
import { PatientOrganisationsView } from "@/features/patient-organisations/ui/patient-organisations-view";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

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

export default function PatientHomePage() {
  const [homeTab, setHomeTab] = useState("appointments");
  const user = useCurrentUser();
  const appointments = useQuery(appointmentsListOptions());
  const organizations = useQuery({
    queryKey: ["patient-organisations", "list"],
    queryFn: fetchOrganizations,
  });
  const appointmentList = appointments.data ?? [];
  const queue = appointmentList.slice(0, 7);
  const nextVisit = appointmentList[0] ?? null;
  const upcomingCount = appointmentList.filter((a) => a.isOnSchedule && a.isEnabled).length;
  const onlineCount = appointmentList.filter((a) => a.isOnline && a.isOnSchedule && a.isEnabled).length;
  const organizationCount = organizations.data?.organizations.length ?? 0;
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-6 p-4 md:p-6">
      <section className="relative overflow-hidden rounded-3xl border bg-card/90 p-6 shadow-sm ring-1 ring-black/5 md:p-7 dark:ring-white/10">
        <div className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              Patient workspace
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              Welcome back{user?.firstName ? `, ${fullName}` : ""}. Keep your full care
              flow in one place: clinic discovery, appointments, and video consultations.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setHomeTab("organizations")}>
                Find clinic
              </Button>
              <Button size="sm" variant="outline" onClick={() => setHomeTab("appointments")}>
                My appointments
              </Button>
            </div>
          </div>
          <Badge variant="default" className="px-3 py-1 text-xs">
            <BadgeCheck className="mr-1 size-3.5" />
            Active profile
          </Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-background/80 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Organizations</p>
            <p className="mt-0.5 text-lg font-semibold">{organizationCount}</p>
          </div>
          <div className="rounded-xl border bg-background/80 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Appointments</p>
            <p className="mt-0.5 text-lg font-semibold">{appointmentList.length}</p>
          </div>
          <div className="rounded-xl border bg-background/80 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Confirmed</p>
            <p className="mt-0.5 text-lg font-semibold">{upcomingCount}</p>
          </div>
          <div className="rounded-xl border bg-background/80 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Video-ready</p>
            <p className="mt-0.5 text-lg font-semibold">{onlineCount}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Card className="gap-4 py-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">Care modules</CardTitle>
            <CardDescription>Old standalone pages are now fully integrated in Home.</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <Tabs value={homeTab} onValueChange={setHomeTab} className="gap-4">
              <TabsList variant="line" className="w-full justify-start gap-1 overflow-auto">
                <TabsTrigger value="organizations">
                  <Hospital className="size-4" />
                  Organizations
                </TabsTrigger>
                <TabsTrigger value="appointments">
                  <CalendarDays className="size-4" />
                  Appointments
                </TabsTrigger>
                <TabsTrigger value="consultations">
                  <Video className="size-4" />
                  Video visits
                </TabsTrigger>
              </TabsList>
              <TabsContent value="organizations" className="rounded-xl border bg-background/60">
                <PatientOrganisationsView embedded />
              </TabsContent>
              <TabsContent value="appointments" className="rounded-xl border bg-background/60">
                <PatientAppointmentsView embedded />
              </TabsContent>
              <TabsContent value="consultations" className="rounded-xl border bg-background/60">
                <PatientConsultationsView embedded />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="gap-3 py-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-base">Quick switch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4">
              <Button
                variant={homeTab === "organizations" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setHomeTab("organizations")}
              >
                <Hospital className="mr-2 size-4" />
                Organizations
              </Button>
              <Button
                variant={homeTab === "appointments" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setHomeTab("appointments")}
              >
                <CalendarDays className="mr-2 size-4" />
                Appointments
              </Button>
              <Button
                variant={homeTab === "consultations" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setHomeTab("consultations")}
              >
                <Video className="mr-2 size-4" />
                Video visits
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={routes.patient.chats}>
                  <MessageSquare className="mr-2 size-4" />
                  Chats
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="gap-3 py-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-base">Focused details</CardTitle>
              <CardDescription>
                {homeTab === "appointments"
                  ? "Nearest visits and their status"
                  : homeTab === "organizations"
                    ? "Available organizations"
                    : "Online consultation readiness"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-4 text-sm">
              {homeTab === "appointments" ? (
                queue.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-4 text-sm">
                    No visits yet.
                  </p>
                ) : (
                  queue.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-lg border bg-background/80 px-3 py-2">
                      <p className="font-medium">
                        Dr. {item.doctorFirstName} {item.doctorLastName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {item.departmentName} · {formatDate(item.date)} {formatTime(item.time)}
                      </p>
                    </div>
                  ))
                )
              ) : null}

              {homeTab === "organizations" ? (
                organizationCount === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-4 text-sm">
                    No organizations available.
                  </p>
                ) : (
                  (organizations.data?.organizations ?? []).slice(0, 4).map((o) => (
                    <div key={o.id} className="rounded-lg border px-3 py-2">
                      <p className="font-medium">{o.name}</p>
                    </div>
                  ))
                )
              ) : null}

              {homeTab === "consultations" ? (
                <div className="space-y-2">
                  <p className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span className="text-muted-foreground">Confirmed</span>
                    <span className="font-semibold">{upcomingCount}</span>
                  </p>
                  <p className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span className="text-muted-foreground">Video-ready</span>
                    <span className="font-semibold">{onlineCount}</span>
                  </p>
                  <p className="text-muted-foreground rounded-lg border bg-background/70 px-3 py-2 text-xs">
                    Join online visits directly from the Video visits tab once confirmed.
                  </p>
                </div>
              ) : null}

              <div className="rounded-lg border bg-background/70 px-3 py-2">
                <p className="text-muted-foreground text-xs">Next visit</p>
                <p className="font-medium">
                  {nextVisit
                    ? `${formatDate(nextVisit.date)} ${formatTime(nextVisit.time)}`
                    : "Not booked"}
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setHomeTab("appointments")}
              >
                <LayoutGrid className="mr-2 size-4" />
                Open full appointments list
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
