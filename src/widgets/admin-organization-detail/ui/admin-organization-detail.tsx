"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { organizationDetailQuery } from "@/entities/organization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { AdminOrgAdminsTab } from "./admin-org-admins-tab";
import { AdminOrgDepartmentsTab } from "./admin-org-departments-tab";
import { AdminOrgOverviewTab } from "./admin-org-overview-tab";
import { AdminOrganizationHeader } from "./admin-organization-header";

interface AdminOrganizationDetailProps {
  orgId: string;
}

export function AdminOrganizationDetail({
  orgId,
}: AdminOrganizationDetailProps) {
  const query = useQuery(organizationDetailQuery(orgId));

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading organization…
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
        Could not load organization. You may not have access to it.
      </div>
    );
  }

  const org = query.data;

  return (
    <div className="flex flex-col gap-6">
      <AdminOrganizationHeader org={org} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <AdminOrgOverviewTab org={org} />
        </TabsContent>
        <TabsContent value="departments" className="pt-4">
          <AdminOrgDepartmentsTab orgId={orgId} />
        </TabsContent>
        <TabsContent value="admins" className="pt-4">
          <AdminOrgAdminsTab orgId={orgId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
