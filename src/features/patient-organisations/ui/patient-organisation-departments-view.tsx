"use client";

import type { Route } from "next";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Layers, Loader2, Search, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  fetchDepartments,
  fetchOrganization,
} from "@/entities/doctor-directory";
import { patientOrganisationDepartmentPath, routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
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

  const departments = useMemo(
    () => deptsQuery.data?.departments ?? [],
    [deptsQuery.data?.departments],
  );

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
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {orgName}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Organization departments. Search by name.
        </p>
      </header>

      <div className="relative max-w-xl">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Department name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-12 rounded-xl border-dashed pl-9"
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

      <Card className="relative overflow-hidden border-dashed bg-card/95 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <div className="pointer-events-none absolute -top-16 right-0 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 size-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <CardContent className="relative pt-6">
          {deptsQuery.isPending ? (
            <div className="flex justify-center py-16">
              <Loader2 className="text-muted-foreground size-8 animate-spin" />
            </div>
          ) : deptsQuery.isError ? (
            <p className="text-destructive text-sm">
              Could not load departments. Check API access.
            </p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium">
                <Sparkles className="text-primary size-3.5" aria-hidden />
                Directory is ready
              </div>
              <p className="text-muted-foreground max-w-lg text-sm">
                {departments.length === 0
                  ? "No departments in this organization yet."
                  : "No matches found. Try another department name."}
              </p>
            </div>
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
                        "flex items-center gap-3 rounded-2xl border bg-background/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-background hover:shadow-md",
                        inactive && "pointer-events-none opacity-60",
                      )}
                      aria-disabled={inactive}
                    >
                      <span className="bg-muted/80 flex size-14 shrink-0 items-center justify-center rounded-xl border shadow-inner">
                        <Layers className="text-muted-foreground size-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xl font-semibold tracking-tight">
                          {dept.name}
                        </span>
                        {inactive ? (
                          <span className="text-muted-foreground text-sm">
                            Unavailable
                          </span>
                        ) : (
                          <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                            Doctors
                            <ArrowRight className="size-3.5" aria-hidden />
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
