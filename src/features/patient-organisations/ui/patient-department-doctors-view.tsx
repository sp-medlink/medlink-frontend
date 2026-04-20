"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Loader2, MessageCircle, Search, Stethoscope, CalendarPlus } from "lucide-react";
import { toast } from "sonner";

import {
  fetchDepartment,
  fetchDoctorDepartments,
  fetchOrganization,
  resolveChatIdForDoctorDepartment,
} from "@/entities/doctor-directory";
import { ApiError } from "@/shared/api";
import {
  env,
  patientOrganisationPath,
  routes,
} from "@/shared/config";
import { doctorChatKeys } from "@/features/doctor-chat/api/query-keys";
import { useDoctorChatUiStore } from "@/features/doctor-chat/model/chat-ui-store";
import { BookAppointmentDialog } from "@/features/patient-appointment-book";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

function doctorAvatarUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${env.apiBaseUrl}${p}`;
  return p;
}

export function PatientDepartmentDoctorsView() {
  const params = useParams();
  const organizationId = params?.organizationId as string | undefined;
  const departmentId = params?.departmentId as string | undefined;
  const [q, setQ] = useState("");
  const [openingId, setOpeningId] = useState<string | null>(null);
  const qc = useQueryClient();
  const openPanel = useDoctorChatUiStore((s) => s.open);
  const openChatThread = useDoctorChatUiStore((s) => s.openChat);

  const orgQuery = useQuery({
    queryKey: ["patient-organisations", "organization", organizationId],
    queryFn: () => fetchOrganization(organizationId!),
    enabled: Boolean(organizationId),
  });

  const deptQuery = useQuery({
    queryKey: [
      "patient-organisations",
      "department",
      organizationId,
      departmentId,
    ],
    queryFn: () => fetchDepartment(organizationId!, departmentId!),
    enabled: Boolean(organizationId && departmentId),
  });

  const doctorsQuery = useQuery({
    queryKey: [
      "patient-organisations",
      "doctors",
      organizationId,
      departmentId,
    ],
    queryFn: () => fetchDoctorDepartments(organizationId!, departmentId!),
    enabled: Boolean(organizationId && departmentId),
  });

  const doctors = doctorsQuery.data?.doctor_departments ?? [];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return doctors;
    return doctors.filter(
      (d) =>
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(needle) ||
        d.position.toLowerCase().includes(needle),
    );
  }, [doctors, q]);

  const onWrite = useCallback(
    async (doctorDepartmentId: string) => {
      setOpeningId(doctorDepartmentId);
      try {
        const chatId = await resolveChatIdForDoctorDepartment(doctorDepartmentId);
        void qc.invalidateQueries({ queryKey: doctorChatKeys.inbox("patient") });
        void qc.invalidateQueries({
          queryKey: doctorChatKeys.messages(chatId),
        });
        openPanel();
        openChatThread(chatId);
        toast.success("Chat opened — you can message now");
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : "Could not open chat";
        toast.error(msg);
      } finally {
        setOpeningId(null);
      }
    },
    [openChatThread, openPanel, qc],
  );

  if (!organizationId || !departmentId) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-destructive text-sm">Invalid link.</p>
      </main>
    );
  }

  const orgName = orgQuery.data?.organization?.name ?? "Organization";
  const deptName = deptQuery.data?.department?.name ?? "Department";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={routes.patient.organisations as Route}>Organizations</Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <Button variant="ghost" size="sm" asChild>
          <Link href={patientOrganisationPath(organizationId) as Route}>
            {orgName}
          </Link>
        </Button>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{deptName}</h1>
        <p className="text-muted-foreground text-sm">
          Department doctors. Click Message to open the chat panel on the right.
        </p>
      </header>

      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Doctor or role…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          aria-label="Search doctors"
          disabled={doctorsQuery.isPending || doctorsQuery.isError}
        />
      </div>

      {doctorsQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : doctorsQuery.isError ? (
        <div className="text-destructive space-y-1 text-sm">
          <p>Could not load doctors.</p>
          <p className="text-muted-foreground font-mono text-xs">
            {doctorsQuery.error instanceof ApiError
              ? `${doctorsQuery.error.status}: ${doctorsQuery.error.message}`
              : doctorsQuery.error instanceof Error
                ? doctorsQuery.error.message
                : String(doctorsQuery.error)}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {doctors.length === 0
            ? "No doctors listed for this department."
            : "No matches."}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((d) => {
            const av = doctorAvatarUrl(d.avatar_path);
            const name = `Dr. ${d.first_name} ${d.last_name}`.trim();
            const busy = openingId === d.doctor_department_id;
            return (
              <li
                key={d.doctor_department_id}
                className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <span className="bg-muted flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
                    {av ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={av}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Stethoscope className="text-muted-foreground size-6" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <span className="block font-medium">{name}</span>
                    {d.position ? (
                      <span className="text-muted-foreground block text-xs">
                        {d.position}
                      </span>
                    ) : null}
                    <span className="text-muted-foreground block text-xs">
                      {d.organization_name} · {d.department_name}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <BookAppointmentDialog
                    orgId={organizationId}
                    deptId={departmentId}
                    doctorDepartmentId={d.doctor_department_id}
                    doctorName={name}
                    departmentName={deptName}
                    trigger={
                      <Button type="button" size="sm" className="gap-2">
                        <CalendarPlus className="size-4" aria-hidden />
                        Book
                      </Button>
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    disabled={busy}
                    onClick={() => void onWrite(d.doctor_department_id)}
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MessageCircle className="size-4" />
                    )}
                    Message
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
