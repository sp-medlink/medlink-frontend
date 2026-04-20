"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Building2, Loader2, Stethoscope } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useAppRole } from "@/entities/session";
import { patientOrganisationDepartmentPath, routes } from "@/shared/config";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";

import { fetchDoctorOwnDepartments } from "../api/chat-api";
import { doctorChatKeys } from "../api/query-keys";
import type { UnifiedInboxRow } from "../api/types";

interface PeerInfoPopoverProps {
  row: UnifiedInboxRow;
  children: ReactNode;
}

/**
 * Contextual popover anchored on the chat header. Pulls the peer's
 * department/organisation from the doctor's own `/user/doctor/departments`
 * list (cached): that endpoint is the only place where the frontend
 * consistently gets department + org names for both scopes. For a
 * patient viewing their doctor, we fall back to the info we already
 * have on the inbox row and surface a direct "Book appointment" CTA
 * that drops them back into the department's doctor list.
 */
export function PeerInfoPopover({ row, children }: PeerInfoPopoverProps) {
  const role = useAppRole();

  const ownDeptsQuery = useQuery({
    queryKey: doctorChatKeys.myChats(),
    queryFn: fetchDoctorOwnDepartments,
    enabled: role === "doctor",
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });

  const ownDept =
    role === "doctor"
      ? ownDeptsQuery.data?.doctors_departments.find(
          (d) => d.id === row.doctorDepartmentId,
        )
      : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 border-neutral-800 bg-neutral-950 p-0 text-neutral-100"
      >
        <header className="border-b border-neutral-800 px-4 pt-4 pb-3">
          <p className="text-sm font-semibold">
            {row.peerDisplayName || (role === "doctor" ? "Patient" : "Doctor")}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {role === "doctor" ? "Patient contact" : "Doctor profile"}
          </p>
        </header>

        <div className="space-y-2.5 px-4 py-3 text-sm">
          {role === "doctor" ? (
            ownDeptsQuery.isPending ? (
              <div className="flex items-center gap-2 text-neutral-400">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading department…
              </div>
            ) : ownDept ? (
              <>
                <Row
                  icon={<Stethoscope className="size-4" aria-hidden />}
                  label="Department"
                  value={ownDept.department_name}
                />
                <Row
                  icon={<Building2 className="size-4" aria-hidden />}
                  label="Organization"
                  value={ownDept.organization_name}
                />
              </>
            ) : (
              <p className="text-muted-foreground text-xs">
                Department info unavailable.
              </p>
            )
          ) : (
            <p className="text-muted-foreground text-xs">
              Chat started from a doctor listing — browse the directory
              to book an appointment with the same doctor.
            </p>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-neutral-800 px-4 py-3">
          {role === "patient" ? (
            <Link
              href={routes.patient.organisations}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
            >
              Book appointment
            </Link>
          ) : null}
          {role === "doctor" && ownDept ? (
            <Link
              href={
                patientOrganisationDepartmentPath(
                  ownDept.organization_id,
                  ownDept.department_id,
                ) as Route
              }
              className="inline-flex items-center gap-1 rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-800"
            >
              Department page
            </Link>
          ) : null}
        </footer>
      </PopoverContent>
    </Popover>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-neutral-500" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="text-muted-foreground block text-[0.7rem] uppercase tracking-wide">
          {label}
        </span>
        <span className="block truncate text-sm">{value || "—"}</span>
      </span>
    </div>
  );
}
