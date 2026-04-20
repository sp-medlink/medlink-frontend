"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, Loader2, Star, UserRound } from "lucide-react";

import {
  doctorDepartmentsByOrgDeptQuery,
  type DoctorDepartment,
} from "@/entities/doctor";
import { DeptAdminToggle } from "@/features/admin-dept-admin-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
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

function initialsOf(row: DoctorDepartment): string {
  const a = row.firstName?.[0] ?? "";
  const b = row.lastName?.[0] ?? "";
  const joined = `${a}${b}`.toUpperCase();
  return joined || "?";
}

function displayNameOf(row: DoctorDepartment): string {
  const full = [row.firstName, row.lastName].filter(Boolean).join(" ");
  return full || row.position || row.id;
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
                  <TableHead>Doctor</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Position
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Slot</TableHead>
                  <TableHead className="hidden lg:table-cell">Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dept-admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((row) => {
                  const name = displayNameOf(row);
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarImage
                              src={row.avatarPath || undefined}
                              alt=""
                            />
                            <AvatarFallback>{initialsOf(row)}</AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium">
                              {name}
                            </span>
                            {row.education ? (
                              <span className="text-muted-foreground truncate text-xs">
                                {row.education}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {row.position || "—"}
                          </span>
                          {row.description ? (
                            <span className="text-muted-foreground line-clamp-1 text-xs">
                              {row.description}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                          <Clock className="size-3" aria-hidden />
                          {row.apptDurationInMinutes} min
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                          <Star className="size-3" aria-hidden />
                          {row.rating > 0 ? row.rating.toFixed(1) : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={row.isActive ? "default" : "secondary"}
                          >
                            {row.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {!row.isEnabled ? (
                            <span className="text-muted-foreground text-xs">
                              Disabled by parent
                            </span>
                          ) : null}
                        </div>
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
                  );
                })}
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
