"use client";

import type { Route } from "next";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GitBranch, Loader2 } from "lucide-react";

import { departmentsByOrgQuery } from "@/entities/department";
import {
  DepartmentCreateDialog,
  DepartmentDeleteButton,
} from "@/features/admin-department-crud";
import { routes } from "@/shared/config";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

interface AdminOrgDepartmentsTabProps {
  orgId: string;
}

export function AdminOrgDepartmentsTab({ orgId }: AdminOrgDepartmentsTabProps) {
  const query = useQuery(departmentsByOrgQuery(orgId));

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Departments</CardTitle>
          <CardDescription>
            Departments group doctors inside this organization.
          </CardDescription>
        </div>
        <DepartmentCreateDialog orgId={orgId} />
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading departments…
          </div>
        ) : query.isError ? (
          <p className="text-destructive text-sm">
            Could not load departments.
          </p>
        ) : query.data && query.data.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((dept) => {
                  const href =
                    `${routes.admin.organizations}/${orgId}/departments/${dept.id}` as Route;
                  return (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <Link href={href} className="font-medium hover:underline">
                          {dept.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {dept.code}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={dept.isActive ? "default" : "secondary"}
                        >
                          {dept.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={href}>Open</Link>
                          </Button>
                          <DepartmentDeleteButton
                            orgId={orgId}
                            deptId={dept.id}
                            deptName={dept.name}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
            <GitBranch
              className="size-8 text-neutral-400 dark:text-neutral-600"
              aria-hidden
            />
            <p className="text-muted-foreground text-sm">
              No departments yet. Add the first one to start onboarding doctors.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
