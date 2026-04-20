"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  Layers3,
  ShieldCheck,
} from "lucide-react";

import { useCurrentUser } from "@/entities/session";
import { myDoctorDepartmentsOptions, myDoctorProfileOptions } from "@/entities/doctor";
import { appointmentKeys, fetchDoctorAppointments } from "@/entities/appointment";
import { DoctorAppointmentsView } from "@/features/doctor-appointments/ui/doctor-appointments-view";
import { DoctorDepartmentsView } from "@/features/doctor-departments/ui/doctor-departments-view";
import { DoctorScheduleView } from "@/features/doctor-schedule/ui/doctor-schedule-view";
import { DoctorVerificationView } from "@/features/doctor-verification/ui/doctor-verification-view";
import { routes } from "@/shared/config";
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

/**
 * Doctor workspace. Single home surface that embeds the four core
 * doctor flows — verification, departments, schedule, appointments —
 * behind a tab bar so the sidebar can stay lean.
 *
 * Plain users (role=`user`, no doctor row yet) are bounced to the
 * verification onboarding page before any of the doctor queries fire.
 */
export default function DoctorHomePage() {
  const user = useCurrentUser();
  const router = useRouter();
  const isDoctor = !!user?.roles.includes("doctor");

  // Must run every render — hooks order is critical. Gate the effect,
  // not the hook.
  useEffect(() => {
    if (user && !isDoctor) {
      router.replace(routes.doctor.verification);
    }
  }, [user, isDoctor, router]);

  const [homeTab, setHomeTab] = useState("appointments");

  // Disable the doctor-only queries while we're waiting on the
  // redirect — otherwise the profile endpoint 403s a plain user on
  // every render.
  const profile = useQuery({
    ...myDoctorProfileOptions(),
    enabled: isDoctor,
  });
  const departments = useQuery({
    ...myDoctorDepartmentsOptions(),
    enabled: isDoctor,
  });

  const list = departments.data ?? [];
  const activeList = list.filter((d) => d.isActive);
  const selectedDept = activeList[0] ?? list[0] ?? null;

  const appointments = useQuery({
    queryKey: [...appointmentKeys.list(), "doctor-dashboard", selectedDept?.id ?? ""],
    queryFn: () => fetchDoctorAppointments(selectedDept!.id),
    enabled: Boolean(isDoctor && selectedDept?.id),
  });

  if (!user) return null;
  if (!isDoctor) return null;

  const deptAppointments = appointments.data ?? [];
  const queue = deptAppointments.slice(0, 7);
  const todaySchedule = deptAppointments.slice(0, 3);
  const onlineCount = deptAppointments.filter((a) => a.isOnline).length;
  const confirmedCount = deptAppointments.filter((a) => a.isOnSchedule && a.isEnabled).length;
  const verificationStatus = profile.data?.verificationStatus ?? "pending";
  const isApproved = verificationStatus === "approved";
  const fullName = `Dr. ${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-6 p-4 md:p-6">
      <section className="relative overflow-hidden rounded-3xl border bg-card/90 p-6 shadow-sm ring-1 ring-black/5 md:p-7 dark:ring-white/10">
        <div className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              Doctor workspace
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              Welcome back{user?.firstName ? `, ${fullName}` : ""}. All core doctor flows
              live here now: verification, departments, schedule, and appointments.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setHomeTab("appointments")}>
                Open appointments
              </Button>
              <Button size="sm" variant="outline" onClick={() => setHomeTab("schedule")}>
                Edit schedule
              </Button>
            </div>
          </div>
          <Badge
            variant={isApproved ? "default" : "secondary"}
            className="capitalize px-3 py-1 text-xs"
          >
            <BadgeCheck className="mr-1 size-3.5" />
            {verificationStatus}
          </Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-background/80 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Departments</p>
            <p className="mt-0.5 text-lg font-semibold">{list.length}</p>
          </div>
          <div className="rounded-xl border bg-background/80 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Active</p>
            <p className="mt-0.5 text-lg font-semibold">{activeList.length}</p>
          </div>
          <div className="rounded-xl border bg-background/80 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Confirmed today</p>
            <p className="mt-0.5 text-lg font-semibold">{confirmedCount}</p>
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
            <CardTitle className="text-base">Core modules</CardTitle>
            <CardDescription>
              Everything from the old separate pages is managed here.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <Tabs value={homeTab} onValueChange={setHomeTab} className="gap-4">
              <TabsList variant="line" className="w-full justify-start gap-1 overflow-auto">
                <TabsTrigger value="verification">
                  <ShieldCheck className="size-4" />
                  Verification
                </TabsTrigger>
                <TabsTrigger value="departments">
                  <Layers3 className="size-4" />
                  Departments
                </TabsTrigger>
                <TabsTrigger value="schedule">
                  <CalendarClock className="size-4" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="appointments">
                  <CalendarDays className="size-4" />
                  Appointments
                </TabsTrigger>
              </TabsList>
              <TabsContent value="verification" className="rounded-xl border bg-background/60">
                <DoctorVerificationView embedded />
              </TabsContent>
              <TabsContent value="departments" className="rounded-xl border bg-background/60">
                <DoctorDepartmentsView embedded />
              </TabsContent>
              <TabsContent value="schedule" className="rounded-xl border bg-background/60">
                <DoctorScheduleView embedded />
              </TabsContent>
              <TabsContent value="appointments" className="rounded-xl border bg-background/60">
                <DoctorAppointmentsView embedded />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="gap-3 py-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-base">Quick switch</CardTitle>
              <CardDescription>
                {selectedDept ? selectedDept.departmentName : "No active department"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-4">
              <Button
                variant={homeTab === "verification" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setHomeTab("verification")}
              >
                Verification
              </Button>
              <Button
                variant={homeTab === "departments" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setHomeTab("departments")}
              >
                Departments
              </Button>
              <Button
                variant={homeTab === "schedule" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setHomeTab("schedule")}
              >
                Schedule
              </Button>
              <Button
                variant={homeTab === "appointments" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setHomeTab("appointments")}
              >
                Appointments
              </Button>
            </CardContent>
          </Card>

          <Card className="gap-3 py-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-base">Focused details</CardTitle>
              <CardDescription>
                {homeTab === "appointments"
                  ? "Most relevant visits right now"
                  : homeTab === "schedule"
                    ? "Upcoming schedule rows"
                    : homeTab === "departments"
                      ? "Current department memberships"
                      : "Verification snapshot"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-4 text-sm">
              {homeTab === "appointments" ? (
                queue.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-4 text-sm">
                    No appointments in queue.
                  </p>
                ) : (
                  queue.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-lg border bg-background/80 px-3 py-2">
                      <p className="font-medium">
                        {formatDate(item.date)} · {formatTime(item.time)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {item.departmentName} · {item.isOnline ? "Online" : "In person"}
                      </p>
                    </div>
                  ))
                )
              ) : null}

              {homeTab === "schedule" ? (
                todaySchedule.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-4 text-sm">
                    No rows in schedule yet.
                  </p>
                ) : (
                  todaySchedule.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <span className="font-medium">{formatDate(item.date)}</span>
                      <span className="text-muted-foreground">{formatTime(item.time)}</span>
                    </div>
                  ))
                )
              ) : null}

              {homeTab === "departments" ? (
                list.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-4 text-sm">
                    No department memberships.
                  </p>
                ) : (
                  list.slice(0, 4).map((d) => (
                    <div key={d.id} className="rounded-lg border px-3 py-2">
                      <p className="font-medium">{d.departmentName || "Department"}</p>
                      <p className="text-muted-foreground text-xs">
                        {d.organizationName || "Organization"} · {d.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  ))
                )
              ) : null}

              {homeTab === "verification" ? (
                <div className="space-y-2 rounded-lg border px-3 py-3">
                  <p>
                    Status:{" "}
                    <span className="font-semibold capitalize">{verificationStatus}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {isApproved
                      ? "Verification is complete. Video tools are fully available."
                      : profile.data?.rejectionReason || "Complete verification to unlock all tools."}
                  </p>
                </div>
              ) : null}

              <div className="rounded-lg border bg-background/70 px-3 py-2">
                <p className="font-medium">{fullName || "Doctor profile"}</p>
                <p className="text-muted-foreground text-xs">
                  {profile.data?.education || "Education details pending"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
