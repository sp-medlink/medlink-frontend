"use client";

import type { Route } from "next";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, GitBranch, Loader2 } from "lucide-react";

import { departmentAsDeptAdminQuery } from "@/entities/department";
import type { DoctorDepartment } from "@/entities/doctor";
import { routes } from "@/shared/config";
import { Badge } from "@/shared/ui/badge";

interface AdminMyDepartmentCardProps {
  row: DoctorDepartment;
}

/**
 * A single row on the dept-admin landing. Renders minimal info from the
 * `doctor_departments` row immediately and back-fills department metadata
 * (name, code, active) from the dept-admin detail endpoint. Each card is
 * its own query so one 403 doesn't take the list down — the backend
 * refuses detail reads unless the caller is an *active* dept-admin of
 * that specific department, so inactive assignments gracefully degrade
 * to a skeleton row.
 */
export function AdminMyDepartmentCard({ row }: AdminMyDepartmentCardProps) {
  const query = useQuery(departmentAsDeptAdminQuery(row.departmentId));
  const href =
    `${routes.admin.departments}/${row.departmentId}` as Route;

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            aria-hidden
          >
            <GitBranch className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            {query.isLoading ? (
              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Loading…
              </div>
            ) : query.data ? (
              <>
                <h3 className="text-base font-semibold tracking-tight">
                  {query.data.name}
                </h3>
                <p className="text-muted-foreground text-xs">
                  Code <span className="font-mono">{query.data.code}</span>
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold tracking-tight">
                  Department
                </h3>
                <p className="text-muted-foreground text-xs font-mono">
                  {row.departmentId}
                </p>
              </>
            )}
          </div>
        </div>
        <ArrowUpRight
          className="size-4 text-neutral-400 transition group-hover:text-neutral-700 dark:group-hover:text-neutral-200"
          aria-hidden
        />
      </div>

      <div className="flex items-center gap-2">
        {query.data ? (
          <Badge variant={query.data.isActive ? "default" : "secondary"}>
            {query.data.isActive ? "Active" : "Inactive"}
          </Badge>
        ) : null}
        {row.position ? (
          <span className="text-muted-foreground text-xs">
            {row.position}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
