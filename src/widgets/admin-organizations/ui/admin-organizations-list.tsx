"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { useAdminCapabilities } from "@/entities/session";
import {
  organizationsListOrgAdminQuery,
  organizationsListPlatformQuery,
} from "@/entities/organization";
import {
  OrganizationCreateDialog,
  PlatformOrganizationCreateDialog,
} from "@/features/admin-organization-crud";

import { AdminOrganizationsTable } from "./admin-organizations-table";

/**
 * Composes the organizations list for `/admin/organizations`.
 *
 * Endpoint choice is driven by the user's intent, not their scope:
 *   - Platform admin → `/user/admin/organizations`, which lists EVERY
 *     org on Medlink (active + inactive). This is the operator
 *     oversight feed.
 *   - Org-admin (non-platform) → `/user/org-admin/organizations`, which
 *     lists only orgs where the caller is in `orgs_admins`.
 *   - Users who are both: we prefer the platform feed so they see the
 *     complete picture; the separate "my orgs" view lives elsewhere
 *     (there's no product requirement yet, but easy to add).
 */
export function AdminOrganizationsList() {
  const caps = useAdminCapabilities();
  const usePlatformFeed = caps.platform;

  const orgAdminQuery = useQuery({
    ...organizationsListOrgAdminQuery(),
    enabled: !usePlatformFeed,
  });
  const platformQuery = useQuery({
    ...organizationsListPlatformQuery(),
    enabled: usePlatformFeed,
  });

  const active = usePlatformFeed ? platformQuery : orgAdminQuery;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Organizations
          </h2>
          <p className="text-muted-foreground text-sm">
            {caps.platform
              ? "Every organization on Medlink. Provision new tenants by assigning their initial admin."
              : "Organizations where you are listed as an org admin."}
          </p>
        </div>
        {caps.platform ? (
          <PlatformOrganizationCreateDialog />
        ) : (
          <OrganizationCreateDialog />
        )}
      </div>

      {active.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading organizations…
        </div>
      ) : active.isError ? (
        <p className="text-destructive text-sm">
          Could not load organizations.
        </p>
      ) : (
        <AdminOrganizationsTable orgs={active.data ?? []} />
      )}
    </section>
  );
}
