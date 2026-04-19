"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronLeft, Layers, Loader2, Stethoscope } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  fetchDepartments,
  fetchDoctorDepartments,
  fetchOrganizations,
  resolveChatIdForDoctorDepartment,
} from "@/entities/doctor-directory";
import { ApiError } from "@/shared/api";
import { env } from "@/shared/config";

import { doctorChatKeys } from "../api/query-keys";
import { useDoctorChatUiStore } from "../model/chat-ui-store";

type Step = "org" | "dept" | "doctor";

function catalogAvatar(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${env.apiBaseUrl}${p}`;
  return p;
}

/**
 * When the patient has no chats yet — step-by-step: organization → department → doctor,
 * then create a chat and open the thread.
 *
 * `chatSurfaceActive` — chat is visible (dock panel open **or** full-page chat).
 * `isOpen` from the store alone is not enough: on /patient/chats the dock is closed,
 * `isOpen === false`, and queries would not run.
 */
export function PatientChatStartWizard({
  chatSurfaceActive,
}: {
  chatSurfaceActive: boolean;
}) {
  const [step, setStep] = useState<Step>("org");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [deptId, setDeptId] = useState<string | null>(null);
  const [starting, setStarting] = useState<string | null>(null);

  const qc = useQueryClient();
  const openChatThread = useDoctorChatUiStore((s) => s.openChat);

  useEffect(() => {
    if (!chatSurfaceActive) {
      setStep("org");
      setOrgId(null);
      setDeptId(null);
      setStarting(null);
    }
  }, [chatSurfaceActive]);

  const orgsQuery = useQuery({
    queryKey: ["chat-wizard", "orgs"],
    queryFn: fetchOrganizations,
    enabled: chatSurfaceActive,
  });

  const deptsQuery = useQuery({
    queryKey: ["chat-wizard", "depts", orgId],
    queryFn: () => fetchDepartments(orgId!),
    enabled: Boolean(chatSurfaceActive && orgId),
  });

  const doctorsQuery = useQuery({
    queryKey: ["chat-wizard", "doctors", orgId, deptId],
    queryFn: () => fetchDoctorDepartments(orgId!, deptId!),
    enabled: Boolean(chatSurfaceActive && orgId && deptId),
  });

  const organizations = orgsQuery.data?.organizations ?? [];
  const departments = deptsQuery.data?.departments ?? [];
  const doctors = doctorsQuery.data?.doctor_departments ?? [];

  const onStartChat = useCallback(
    async (doctorDepartmentId: string) => {
      setStarting(doctorDepartmentId);
      try {
        const chatId = await resolveChatIdForDoctorDepartment(doctorDepartmentId);
        void qc.invalidateQueries({ queryKey: doctorChatKeys.inbox("patient") });
        void qc.invalidateQueries({ queryKey: doctorChatKeys.messages(chatId) });
        openChatThread(chatId);
        toast.success("Chat opened");
      } catch (e) {
        const msg =
          e instanceof ApiError ? e.message : "Could not start chat";
        toast.error(msg);
      } finally {
        setStarting(null);
      }
    },
    [openChatThread, qc],
  );

  const goBack = () => {
    if (step === "doctor") {
      setStep("dept");
      setDeptId(null);
    } else if (step === "dept") {
      setStep("org");
      setOrgId(null);
    }
  };

  if (step === "org") {
    return (
      <li className="flex flex-col gap-3 px-2 py-2">
        <p className="text-center text-sm font-medium text-neutral-200">
          New conversation
        </p>
        <p className="text-center text-xs leading-relaxed text-neutral-500">
          Choose an organization, then a department and a doctor.
        </p>
        {orgsQuery.isPending ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-neutral-400" />
          </div>
        ) : orgsQuery.isError ? (
          <p className="text-center text-xs text-red-300/90">
            Could not load organizations.
          </p>
        ) : organizations.length === 0 ? (
          <p className="text-center text-xs text-neutral-500">
            No organizations in the directory.
          </p>
        ) : (
          <ul className="flex max-h-[min(50vh,420px)] flex-col gap-1.5 overflow-y-auto">
            {organizations.map((o) => {
              const av = catalogAvatar(o.avatar_path);
              const inactive = o.is_active === false;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    disabled={inactive}
                    onClick={() => {
                      setOrgId(o.id);
                      setStep("dept");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2.5 text-left transition hover:border-neutral-600 hover:bg-neutral-800/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-800">
                      {av ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={av} alt="" className="size-full object-cover" />
                      ) : (
                        <Building2 className="size-5 text-neutral-500" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-neutral-100">
                      {o.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  if (step === "dept") {
    return (
      <li className="flex flex-col gap-3 px-2 py-2">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1 self-start text-xs font-medium text-emerald-400/90 hover:underline"
        >
          <ChevronLeft className="size-4" />
          Organizations
        </button>
        <p className="text-sm font-medium text-neutral-200">Department</p>
        {deptsQuery.isPending ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-neutral-400" />
          </div>
        ) : deptsQuery.isError ? (
          <p className="text-xs text-red-300/90">Could not load departments.</p>
        ) : departments.length === 0 ? (
          <p className="text-xs text-neutral-500">No departments.</p>
        ) : (
          <ul className="flex max-h-[min(50vh,420px)] flex-col gap-1.5 overflow-y-auto">
            {departments.map((d) => {
              const bad =
                d.is_active === false || d.is_enabled === false;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    disabled={bad}
                    onClick={() => {
                      setDeptId(d.id);
                      setStep("doctor");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2.5 text-left transition hover:border-neutral-600 hover:bg-neutral-800/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Layers className="size-5 shrink-0 text-neutral-500" />
                    <span className="min-w-0 flex-1 truncate text-sm text-neutral-100">
                      {d.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 px-2 py-2">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-1 self-start text-xs font-medium text-emerald-400/90 hover:underline"
      >
        <ChevronLeft className="size-4" />
        Departments
      </button>
      <p className="text-sm font-medium text-neutral-200">Doctor</p>
      {doctorsQuery.isPending ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-neutral-400" />
        </div>
      ) : doctorsQuery.isError ? (
        <p className="text-xs text-red-300/90">
          Could not load doctors. Open the directory on the site or try again
          later.
        </p>
      ) : doctors.length === 0 ? (
        <p className="text-xs text-neutral-500">No doctors in this department.</p>
      ) : (
        <ul className="flex max-h-[min(50vh,420px)] flex-col gap-1.5 overflow-y-auto">
          {doctors.map((doc) => {
            const name = `Dr. ${doc.first_name} ${doc.last_name}`.trim();
            const av = catalogAvatar(doc.avatar_path);
            const busy = starting === doc.doctor_department_id;
            return (
              <li key={doc.doctor_department_id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onStartChat(doc.doctor_department_id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2.5 text-left transition hover:border-emerald-600/50 hover:bg-neutral-800/80"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800">
                    {av ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={av} alt="" className="size-full object-cover" />
                    ) : (
                      <Stethoscope className="size-5 text-neutral-500" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-neutral-100">
                      {name}
                    </span>
                    {doc.position ? (
                      <span className="block truncate text-xs text-neutral-500">
                        {doc.position}
                      </span>
                    ) : null}
                  </span>
                  {busy ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-emerald-400" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
