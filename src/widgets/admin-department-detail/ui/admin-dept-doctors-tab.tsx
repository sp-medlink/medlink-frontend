"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, UserRound } from "lucide-react";

import { doctorDepartmentsByOrgDeptQuery } from "@/entities/doctor";
import { DeptAdminToggle } from "@/features/admin-dept-admin-toggle";
import { Badge } from "@/shared/ui/badge";
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

interface AdminDeptDoctorsTabProps {
  orgId: string;
  deptId: string;
}

/**
 * Org-admin-scoped doctors view. Allows promoting a doctor to dept-admin
 * via {@link DeptAdminToggle}. Dept-admin-scoped doctors view lives in the
 * dept-admin surface and has a different row-action set (toggle active +
 * remove, no promote).
 */
export function AdminDeptDoctorsTab({
  orgId,
  deptId,
}: AdminDeptDoctorsTabProps) {
  const query = useQuery(doctorDepartmentsByOrgDeptQuery(orgId, deptId));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctors</CardTitle>
        <CardDescription>
          Doctors assigned to this department. Toggle the admin switch to
          grant department-level administrative rights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading doctors…
          </div>
        ) : query.isError ? (
          <p className="text-destructive text-sm">Could not load doctors.</p>
        ) : query.data && query.data.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Doctor ID
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dept-admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {row.position || "—"}
                        </span>
                        {row.description ? (
                          <span className="text-muted-foreground text-xs">
                            {row.description}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs sm:table-cell">
                      {row.doctorId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.isActive ? "default" : "secondary"}>
                        {row.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DeptAdminToggle
                        orgId={orgId}
                        deptId={deptId}
                        docDeptId={row.id}
                        isDeptAdmin={row.isDeptAdmin}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
            <UserRound
              className="size-7 text-neutral-400 dark:text-neutral-600"
              aria-hidden
            />
            <p className="text-muted-foreground text-sm">
              No doctors in this department yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
