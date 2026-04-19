"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GitBranch, Loader2 } from "lucide-react";

import { myDoctorDepartmentsQuery } from "@/entities/doctor";

import { AdminMyDepartmentCard } from "./admin-my-department-card";

/**
 * Dept-admin landing at `/admin/departments`. Lists every department the
 * current user administers. "Administers" = a `doctor_departments` row
 * with `is_dept_admin = true` — filter is client-side because no
 * dedicated list endpoint exists in the dept-admin backend namespace.
 */
export function AdminMyDepartments() {
  const query = useQuery(myDoctorDepartmentsQuery());

  const rows = useMemo(
    () => (query.data ?? []).filter((row) => row.isDeptAdmin),
    [query.data],
  );

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Departments I administer
        </h2>
        <p className="text-muted-foreground text-sm">
          Open a department to manage its doctors and status.
        </p>
      </div>

      {query.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading departments…
        </div>
      ) : query.isError ? (
        <p className="text-destructive text-sm">
          Could not load your departments.
        </p>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
          <GitBranch
            className="size-7 text-neutral-400 dark:text-neutral-600"
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">
              You don&apos;t administer any departments yet
            </p>
            <p className="text-muted-foreground text-xs">
              An organization admin can promote you to a department admin
              from their department detail page.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <AdminMyDepartmentCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </section>
  );
}
