"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { departmentByOrgQuery } from "@/entities/department";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { AdminDeptDoctorsTab } from "./admin-dept-doctors-tab";
import { AdminDeptOverviewTab } from "./admin-dept-overview-tab";
import { AdminDepartmentHeader } from "./admin-department-header";

interface AdminDepartmentDetailOrgScopeProps {
  orgId: string;
  deptId: string;
}

/**
 * Department detail page rendered under the org-admin drill-down.
 * Uses `/user/org-admin/*` endpoints throughout.
 *
 * The dept-admin flat surface gets a sister widget that swaps the data
 * source and row actions (see turn 2).
 */
export function AdminDepartmentDetailOrgScope({
  orgId,
  deptId,
}: AdminDepartmentDetailOrgScopeProps) {
  const query = useQuery(departmentByOrgQuery(orgId, deptId));

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading department…
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
        Could not load department.
      </div>
    );
  }

  const dept = query.data;

  return (
    <div className="flex flex-col gap-6">
      <AdminDepartmentHeader dept={dept} scope={{ kind: "org", orgId }} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <AdminDeptOverviewTab
            dept={dept}
            scope={{ kind: "org", orgId, deptId }}
          />
        </TabsContent>
        <TabsContent value="doctors" className="pt-4">
          <AdminDeptDoctorsTab orgId={orgId} deptId={deptId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
