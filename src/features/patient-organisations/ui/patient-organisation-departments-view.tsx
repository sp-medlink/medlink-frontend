"use client";

import type { Route } from "next";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Layers, Loader2, Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  fetchDepartments,
  fetchOrganization,
} from "@/entities/doctor-directory";
import { patientOrganisationDepartmentPath, routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

export function PatientOrganisationDepartmentsView() {
  const params = useParams();
  const organizationId = params?.organizationId as string | undefined;
  const [q, setQ] = useState("");

  const orgQuery = useQuery({
    queryKey: ["patient-organisations", "organization", organizationId],
    queryFn: () => fetchOrganization(organizationId!),
    enabled: Boolean(organizationId),
  });

  const deptsQuery = useQuery({
    queryKey: ["patient-organisations", "departments", organizationId],
    queryFn: () => fetchDepartments(organizationId!),
    enabled: Boolean(organizationId),
  });

  const departments = deptsQuery.data?.departments ?? [];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return departments;
    return departments.filter((d) => d.name.toLowerCase().includes(needle));
  }, [departments, q]);

  if (!organizationId) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-destructive text-sm">Invalid link.</p>
      </main>
    );
  }

  const orgName = orgQuery.data?.organization?.name ?? "Organization";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
          <Link href={routes.patient.organisations as Route}>
            <ArrowLeft className="size-4" aria-hidden />
            Organizations
          </Link>
        </Button>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{orgName}</h1>
        <p className="text-muted-foreground text-sm">
          Organization departments. Search by name.
        </p>
      </header>

      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Department name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          aria-label="Search departments"
          disabled={deptsQuery.isPending || deptsQuery.isError}
        />
      </div>

      {orgQuery.isPending ? (
        <div className="flex justify-center py-8">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : orgQuery.isError ? (
        <p className="text-destructive text-sm">
          Could not load the organization (it may be inactive or missing from
          the directory).
        </p>
      ) : null}

      {deptsQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : deptsQuery.isError ? (
        <p className="text-destructive text-sm">
          Could not load departments. Check API access.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {departments.length === 0
            ? "No departments in this organization."
            : "No matches — try a different search."}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((dept) => {
            const inactive =
              dept.is_active === false || dept.is_enabled === false;
            return (
              <li key={dept.id}>
                <Link
                  href={
                    patientOrganisationDepartmentPath(
                      organizationId,
                      dept.id,
                    ) as Route
                  }
                  className={cn(
                    "flex gap-3 rounded-xl border p-4 transition hover:bg-muted/50",
                    inactive && "pointer-events-none opacity-60",
                  )}
                  aria-disabled={inactive}
                >
                  <span className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg">
                    <Layers className="text-muted-foreground size-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{dept.name}</span>
                    {inactive ? (
                      <span className="text-muted-foreground text-xs">
                        Unavailable
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Doctors →
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
