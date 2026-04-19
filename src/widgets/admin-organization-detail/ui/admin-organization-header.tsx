"use client";

import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

import type { Organization } from "@/entities/organization";
import {
  OrganizationActiveToggle,
  OrganizationDeleteButton,
} from "@/features/admin-organization-crud";
import { routes } from "@/shared/config";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

interface AdminOrganizationHeaderProps {
  org: Organization;
}

export function AdminOrganizationHeader({ org }: AdminOrganizationHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="w-fit text-neutral-500 dark:text-neutral-400"
      >
        <Link href={routes.admin.organizations}>
          <ArrowLeft className="mr-1.5 size-4" aria-hidden />
          All organizations
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            aria-hidden
          >
            <Building2 className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {org.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              UIN <span className="font-mono">{org.uin}</span> ·{" "}
              {org.phoneNumber || "No phone"}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={org.isActive ? "default" : "secondary"}>
                {org.isActive ? "Active" : "Inactive"}
              </Badge>
              {org.rating > 0 ? (
                <Badge variant="outline">Rating {org.rating.toFixed(1)}</Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <OrganizationActiveToggle orgId={org.id} isActive={org.isActive} />
          <OrganizationDeleteButton
            orgId={org.id}
            orgName={org.name}
            redirectOnSuccess
          />
        </div>
      </div>
    </div>
  );
}
