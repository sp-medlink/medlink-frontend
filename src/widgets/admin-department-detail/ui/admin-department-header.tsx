"use client";

import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft, GitBranch } from "lucide-react";

import type { Department } from "@/entities/department";
import {
  DepartmentActiveToggle,
  DepartmentDeleteButton,
} from "@/features/admin-department-crud";
import { routes } from "@/shared/config";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

type Scope =
  | { kind: "org"; orgId: string }
  | { kind: "dept" };

interface AdminDepartmentHeaderProps {
  dept: Department;
  scope: Scope;
}

export function AdminDepartmentHeader({
  dept,
  scope,
}: AdminDepartmentHeaderProps) {
  const backHref: Route =
    scope.kind === "org"
      ? (`${routes.admin.organizations}/${scope.orgId}` as Route)
      : (routes.admin.departments as Route);
  const backLabel =
    scope.kind === "org" ? "Back to organization" : "All my departments";

  const toggleScope =
    scope.kind === "org"
      ? ({ kind: "org", orgId: scope.orgId, deptId: dept.id } as const)
      : ({ kind: "dept", deptId: dept.id } as const);

  return (
    <div className="flex flex-col gap-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="w-fit text-neutral-500 dark:text-neutral-400"
      >
        <Link href={backHref}>
          <ArrowLeft className="mr-1.5 size-4" aria-hidden />
          {backLabel}
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            aria-hidden
          >
            <GitBranch className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {dept.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              Code <span className="font-mono">{dept.code}</span>
            </p>
            <div className="mt-1">
              <Badge variant={dept.isActive ? "default" : "secondary"}>
                {dept.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DepartmentActiveToggle
            isActive={dept.isActive}
            scope={toggleScope}
          />
          {scope.kind === "org" ? (
            <DepartmentDeleteButton
              orgId={scope.orgId}
              deptId={dept.id}
              deptName={dept.name}
              redirectOnSuccess
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
