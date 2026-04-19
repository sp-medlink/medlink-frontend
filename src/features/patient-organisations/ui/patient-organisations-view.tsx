"use client";

import type { Route } from "next";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { fetchOrganizations } from "@/entities/doctor-directory";
import { env, patientOrganisationPath } from "@/shared/config";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

function orgAvatarUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${env.apiBaseUrl}${p}`;
  return p;
}

export function PatientOrganisationsView() {
  const [q, setQ] = useState("");
  const orgsQuery = useQuery({
    queryKey: ["patient-organisations", "list"],
    queryFn: fetchOrganizations,
  });

  const organizations = orgsQuery.data?.organizations ?? [];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return organizations;
    return organizations.filter((o) => o.name.toLowerCase().includes(needle));
  }, [organizations, q]);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
        <p className="text-muted-foreground text-sm">
          Search by name. All organizations available in the directory.
        </p>
      </header>

      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Organization name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          aria-label="Search organizations"
        />
      </div>

      {orgsQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : orgsQuery.isError ? (
        <p className="text-destructive text-sm">
          Could not load organizations. Check that you are signed in and
          medlink-api is running.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {organizations.length === 0
            ? "No organizations in the API response."
            : "No matches — try a different search."}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((org) => {
            const av = orgAvatarUrl(org.avatar_path);
            const inactive = org.is_active === false;
            return (
              <li key={org.id}>
                <Link
                  href={patientOrganisationPath(org.id) as Route}
                  className={cn(
                    "flex gap-3 rounded-xl border p-4 transition hover:bg-muted/50",
                    inactive && "opacity-60",
                  )}
                >
                  <span className="bg-muted flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    {av ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={av} alt="" className="size-full object-cover" />
                    ) : (
                      <Building2 className="text-muted-foreground size-6" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{org.name}</span>
                    {inactive ? (
                      <span className="text-muted-foreground text-xs">
                        Inactive
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Departments →
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
