"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, UserRound } from "lucide-react";

import { doctorDepartmentsAsDeptAdminQuery } from "@/entities/doctor";
import {
  DoctorDeptActiveToggle,
  DoctorDeptRemoveButton,
} from "@/features/admin-doctor-dept-crud";
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

interface AdminDeptDoctorsTabDeptScopeProps {
  deptId: string;
}

/**
 * Dept-admin-scoped doctors tab. Row actions here are **toggle active**
 * and **remove** — both routed through `/user/dept-admin/*`. The
 * promote-to-dept-admin action stays with the org-admin scope because
 * the backend only exposes that mutation under `/user/org-admin/*`.
 */
export function AdminDeptDoctorsTabDeptScope({
  deptId,
}: AdminDeptDoctorsTabDeptScopeProps) {
  const query = useQuery(doctorDepartmentsAsDeptAdminQuery(deptId));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctors</CardTitle>
        <CardDescription>
          Activate or deactivate doctors in your department, or remove
          them entirely.
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
                  <TableHead>Role</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      {row.isDeptAdmin ? (
                        <Badge variant="default">Dept-admin</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Doctor
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DoctorDeptActiveToggle
                        deptId={deptId}
                        docDeptId={row.id}
                        isActive={row.isActive}
                        doctorName={row.position || undefined}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DoctorDeptRemoveButton
                        deptId={deptId}
                        docDeptId={row.id}
                        doctorLabel={row.position || "this doctor"}
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
