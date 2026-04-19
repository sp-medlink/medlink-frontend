"use client";

import type { Department } from "@/entities/department";
import { DepartmentEditForm } from "@/features/admin-department-crud";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type Scope =
  | { kind: "org"; orgId: string; deptId: string }
  | { kind: "dept"; deptId: string };

interface AdminDeptOverviewTabProps {
  dept: Department;
  scope: Scope;
}

export function AdminDeptOverviewTab({
  dept,
  scope,
}: AdminDeptOverviewTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department details</CardTitle>
        <CardDescription>Change name or short code.</CardDescription>
      </CardHeader>
      <CardContent>
        <DepartmentEditForm dept={dept} scope={scope} />
      </CardContent>
    </Card>
  );
}
