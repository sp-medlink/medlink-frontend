"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { departmentAsDeptAdminQuery } from "@/entities/department";
import { ApiError } from "@/shared/api";
import { routes } from "@/shared/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { AdminDepartmentHeader } from "./admin-department-header";
import { AdminDeptDoctorsTabDeptScope } from "./admin-dept-doctors-tab-dept-scope";
import { AdminDeptOverviewTab } from "./admin-dept-overview-tab";

interface AdminDepartmentDetailDeptScopeProps {
  deptId: string;
}

/**
 * Department detail rendered under the **dept-admin** flat surface.
 *
 * Authorization is enforced server-side: the `/user/dept-admin/*`
 * endpoints all check `is_dept_admin && is_active` on the caller's
 * `doctor_departments` row. A non-admin hitting this page by direct URL
 * gets a 403 from the detail query, which we translate into a redirect
 * back to the dept-admin landing so the UX stays coherent.
 */
export function AdminDepartmentDetailDeptScope({
  deptId,
}: AdminDepartmentDetailDeptScopeProps) {
  const router = useRouter();
  const query = useQuery(departmentAsDeptAdminQuery(deptId));

  const isForbidden =
    query.error instanceof ApiError &&
    (query.error.status === 403 || query.error.status === 404);

  useEffect(() => {
    if (isForbidden) {
      router.replace(routes.admin.departments);
    }
  }, [isForbidden, router]);

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading department…
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        You no longer have access to this department.
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
      <AdminDepartmentHeader dept={dept} scope={{ kind: "dept" }} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <AdminDeptOverviewTab
            dept={dept}
            scope={{ kind: "dept", deptId }}
          />
        </TabsContent>
        <TabsContent value="doctors" className="pt-4">
          <AdminDeptDoctorsTabDeptScope deptId={deptId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
