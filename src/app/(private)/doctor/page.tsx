"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Clock3,
  Layers3,
  ShieldCheck,
  Stethoscope,
  Video,
} from "lucide-react";

import { useCurrentUser } from "@/entities/session";
import {
  myDoctorDepartmentsOptions,
  myDoctorProfileOptions,
} from "@/entities/doctor";
import {
  appointmentKeys,
  fetchDoctorAppointments,
  isTerminalStatus,
} from "@/entities/appointment";
import type { Appointment } from "@/entities/appointment";
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

function parseApptDateTime(a: Appointment): Date | null {
  const d = a.date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!d) return null;
  const t = a.time.match(/T(\d{2}):(\d{2})|^(\d{2}):(\d{2})/);
  const hours = t ? Number(t[1] ?? t[3]) : 0;
  const minutes = t ? Number(t[2] ?? t[4]) : 0;
  return new Date(
    Number(d[1]),
    Number(d[2]) - 1,
    Number(d[3]),
    hours,
    minutes,
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatApptDate(a: Appointment): string {
  const d = parseApptDateTime(a);
  if (!d) return a.date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

function formatApptTime(a: Appointment): string {
  const d = parseApptDateTime(a);
  if (!d) return a.time;
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function patientName(a: Appointment): string {
  const name = `${a.patientFirstName} ${a.patientLastName}`.trim();
  return name || "Unknown patient";
}

function patientInitials(a: Appointment): string {
  const first = a.patientFirstName.trim()[0] ?? "";
  const last = a.patientLastName.trim()[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

export default function DoctorHomePage() {
  const user = useCurrentUser();
  const router = useRouter();
  const isDoctor = !!user?.roles.includes("doctor");

  useEffect(() => {
    if (user && !isDoctor) {
      router.replace(`${routes.doctor.practice}#verification`);
    }
  }, [user, isDoctor, router]);

  const profile = useQuery({
    ...myDoctorProfileOptions(),
    enabled: isDoctor,
  });
  const departments = useQuery({
    ...myDoctorDepartmentsOptions(),
    enabled: isDoctor,
  });

  // Memoize so the `useEffect` below doesn't refire on every render —
  // `departments.data ?? []` would otherwise produce a fresh array.
  const deptList = useMemo(
    () => departments.data ?? [],
    [departments.data],
  );
  const activeDepts = useMemo(
    () => deptList.filter((d) => d.isActive),
    [deptList],
  );

  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Auto-pick the first active dept once data lands, but don't fight
  // the user's explicit pick — so only set if current selection is
  // either null or no longer in the list (e.g. dept removed).
  useEffect(() => {
    if (deptList.length === 0) return;
    const exists = deptList.some((d) => d.id === selectedDeptId);
    if (exists) return;
    const first = activeDepts[0] ?? deptList[0];
    if (first) setSelectedDeptId(first.id);
  }, [deptList, activeDepts, selectedDeptId]);

  const selectedDept =
    deptList.find((d) => d.id === selectedDeptId) ??
    activeDepts[0] ??
    deptList[0] ??
    null;

  const appointments = useQuery({
    queryKey: [
      ...appointmentKeys.list(),
      "doctor-dashboard",
      selectedDept?.id ?? "",
    ],
    queryFn: () => fetchDoctorAppointments(selectedDept!.id),
    enabled: Boolean(isDoctor && selectedDept?.id),
  });

  if (!user || !isDoctor) return null;

  const allAppts = appointments.data ?? [];
  const now = new Date();
  const activeAppts = allAppts.filter(
    (a) => !isTerminalStatus(a.status) && a.isEnabled,
  );
  const todayAppts = activeAppts
    .filter((a) => {
      const d = parseApptDateTime(a);
      return d && isSameDay(d, now);
    })
    .sort((a, b) => {
      const da = parseApptDateTime(a)?.getTime() ?? 0;
      const db = parseApptDateTime(b)?.getTime() ?? 0;
      return da - db;
    });
  const upcomingAppts = activeAppts
    .filter((a) => {
      const d = parseApptDateTime(a);
      return d && !isSameDay(d, now) && d.getTime() > now.getTime();
    })
    .sort((a, b) => {
      const da = parseApptDateTime(a)?.getTime() ?? 0;
      const db = parseApptDateTime(b)?.getTime() ?? 0;
      return da - db;
    })
    .slice(0, 5);

  const onlineCount = activeAppts.filter((a) => a.isOnline).length;
  const confirmedCount = activeAppts.filter(
    (a) => a.status === "confirmed",
  ).length;
  const verificationStatus = profile.data?.verificationStatus ?? "pending";
  const isApproved = verificationStatus === "approved";
  const fullName =
    `Dr. ${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const loadingAppts = appointments.isPending && selectedDept !== null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col gap-6 p-4 md:p-6">
      <section className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-black/5 md:p-7">
        <div className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Doctor workspace
            </p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {fullName ? `Welcome back, ${fullName}` : "Welcome back"}
            </h1>
            {selectedDept ? (
              deptList.length > 1 ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Viewing</span>
                  <select
                    value={selectedDept.id}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="bg-background hover:border-primary/40 focus-visible:ring-primary/30 rounded-md border px-2 py-1 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2"
                    aria-label="Active department"
                  >
                    {deptList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.departmentName}
                        {d.organizationName ? ` · ${d.organizationName}` : ""}
                        {!d.isActive ? " (inactive)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Viewing{" "}
                  <span className="text-foreground font-medium">
                    {selectedDept.departmentName}
                  </span>
                  {" · "}
                  <span>{selectedDept.organizationName}</span>
                </p>
              )
            ) : (
              <p className="text-muted-foreground text-sm">
                No active department — onboard one to start seeing patients.
              </p>
            )}
          </div>
          <Badge
            variant={isApproved ? "default" : "secondary"}
            className="px-3 py-1 text-xs capitalize"
          >
            <BadgeCheck className="mr-1 size-3.5" />
            {verificationStatus}
          </Badge>
        </div>
        <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Today"
            value={todayAppts.length}
            hint={todayAppts.length === 1 ? "visit" : "visits"}
          />
          <StatTile
            label="Confirmed"
            value={confirmedCount}
            hint="ready to see"
          />
          <StatTile
            label="Online"
            value={onlineCount}
            hint="video-capable"
          />
          <StatTile
            label="Departments"
            value={activeDepts.length}
            hint={`of ${deptList.length}`}
          />
        </div>
      </section>

      {!isApproved ? (
        <Card className="border-amber-400/60 bg-amber-50/60 shadow-sm">
          <CardHeader className="gap-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-amber-700" />
              Complete verification to unlock video visits
            </CardTitle>
            <CardDescription>
              {profile.data?.rejectionReason ||
                "Your verification is still under review. Video tools are disabled until approval."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href={`${routes.doctor.practice}#verification`}>
                Open verification
                <ArrowRight className="ml-1.5 size-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <DashboardCard
          icon={<CalendarDays className="size-4 text-primary" />}
          title="Today's schedule"
          description={
            selectedDept
              ? `Visits on ${selectedDept.departmentName} today`
              : "Today's visits"
          }
          href={routes.doctor.appointments}
          linkLabel="Open appointments"
        >
          {loadingAppts ? (
            <SkeletonRows />
          ) : todayAppts.length === 0 ? (
            <EmptyState text="Nothing on the calendar for today." />
          ) : (
            <ul className="flex flex-col gap-2">
              {todayAppts.map((a) => (
                <ApptRow key={a.id} a={a} />
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard
          icon={<CalendarClock className="size-4 text-primary" />}
          title="Coming up"
          description="Next few scheduled visits"
          href={routes.doctor.appointments}
          linkLabel="All appointments"
        >
          {loadingAppts ? (
            <SkeletonRows />
          ) : upcomingAppts.length === 0 ? (
            <EmptyState text="No upcoming visits past today." />
          ) : (
            <ul className="flex flex-col gap-2">
              {upcomingAppts.map((a) => (
                <ApptRow key={a.id} a={a} showDate />
              ))}
            </ul>
          )}
        </DashboardCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <DashboardCard
          icon={<Layers3 className="size-4 text-primary" />}
          title="Departments"
          description="Where you practice"
          href={`${routes.doctor.practice}#departments`}
          linkLabel="Manage"
        >
          {departments.isPending ? (
            <SkeletonRows />
          ) : deptList.length === 0 ? (
            <EmptyState text="You haven't joined any departments yet." />
          ) : (
            <ul className="flex flex-col gap-2">
              {deptList.slice(0, 4).map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-background/70 px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {d.departmentName || "Department"}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {d.organizationName || "Organization"}
                    </p>
                  </div>
                  <Badge variant={d.isActive ? "default" : "outline"}>
                    {d.isActive ? "Active" : "Inactive"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard
          icon={<Stethoscope className="size-4 text-primary" />}
          title="Your profile"
          description="What patients see on your page"
          href={routes.settings}
          linkLabel="Edit profile"
        >
          <div className="flex flex-col gap-2 text-sm">
            <Row
              label="Name"
              value={fullName || "—"}
            />
            <Row
              label="Education"
              value={profile.data?.education || "Not set"}
              muted={!profile.data?.education}
            />
            <Row
              label="Verification"
              value={
                <span className="inline-flex items-center gap-1.5 capitalize">
                  {isApproved ? (
                    <BadgeCheck className="size-3.5 text-emerald-600" />
                  ) : (
                    <ShieldCheck className="size-3.5 text-amber-600" />
                  )}
                  {verificationStatus}
                </span>
              }
            />
          </div>
        </DashboardCard>
      </section>
    </main>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-background/80 px-3 py-2.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-1.5 text-lg font-semibold">
        {value}
        {hint ? (
          <span className="text-muted-foreground text-xs font-normal">
            {hint}
          </span>
        ) : null}
      </p>
    </div>
  );
}

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}

function DashboardCard({
  icon,
  title,
  description,
  href,
  linkLabel,
  children,
}: DashboardCardProps) {
  return (
    <Card className="shadow-sm ring-1 ring-black/5">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            {icon}
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          ) : null}
        </div>
        <Link
          href={href as never}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 text-xs font-medium"
        >
          {linkLabel}
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function ApptRow({ a, showDate = false }: { a: Appointment; showDate?: boolean }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border bg-background/70 px-3 py-2.5 text-sm">
      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
        {patientInitials(a)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{patientName(a)}</p>
        <p className="text-muted-foreground flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs">
          <span className="inline-flex items-center gap-1">
            {showDate ? (
              <>
                <CalendarDays className="size-3" aria-hidden />
                {formatApptDate(a)}
              </>
            ) : (
              <>
                <Clock3 className="size-3" aria-hidden />
                {formatApptTime(a)}
              </>
            )}
          </span>
          {showDate ? (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3" aria-hidden />
              {formatApptTime(a)}
            </span>
          ) : null}
          {a.isOnline ? (
            <span className="inline-flex items-center gap-1">
              <Video className="size-3" aria-hidden />
              Online
            </span>
          ) : null}
        </p>
      </div>
      <AppointmentStatusBadge
        status={a.status}
        detail={a.cancellationReason || undefined}
      />
    </li>
  );
}

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="grid grid-cols-[90px_1fr] items-start gap-2 rounded-lg border bg-background/70 px-3 py-2">
      <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn("text-sm", muted && "text-muted-foreground italic")}
      >
        {value}
      </span>
    </div>
  );
}

function SkeletonRows() {
  return (
    <ul className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="bg-muted/40 h-[54px] animate-pulse rounded-xl border"
        />
      ))}
    </ul>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-muted-foreground rounded-lg border border-dashed bg-background/50 px-4 py-6 text-center text-sm">
      {text}
    </p>
  );
}
