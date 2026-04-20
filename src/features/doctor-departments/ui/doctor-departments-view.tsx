"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  doctorDepartmentKeys,
  myDoctorDepartmentsOptions,
  removeDoctorFromDepartment,
  setDoctorDeptActive,
} from "@/entities/doctor";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

interface DoctorDepartmentsViewProps {
  embedded?: boolean;
}

export function DoctorDepartmentsView({ embedded = false }: DoctorDepartmentsViewProps) {
  const qc = useQueryClient();
  const q = useQuery(myDoctorDepartmentsOptions());
  const showHeader = !embedded;

  const toggle = useMutation({
    mutationFn: (p: { id: string; deptId: string; active: boolean }) =>
      setDoctorDeptActive(p.deptId, p.id, p.active),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: doctorDepartmentKeys.all() });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Error");
    },
  });

  const del = useMutation({
    mutationFn: (p: { id: string; deptId: string }) =>
      removeDoctorFromDepartment(p.deptId, p.id),
    onSuccess: () => {
      toast.success("Profile removed");
      void qc.invalidateQueries({ queryKey: doctorDepartmentKeys.all() });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Error");
    },
  });

  return (
    <main
      className={cn(
        "mx-auto flex w-full flex-col gap-6",
        embedded ? "max-w-none p-4 sm:p-5" : "min-h-screen max-w-3xl p-6",
      )}
    >
      {showHeader ? (
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Per-department profiles: status and removal.
          </p>
        </header>
      ) : null}

      {q.isPending ? (
        <Loader2 className="size-8 animate-spin" />
      ) : q.isError ? (
        <p className="text-destructive text-sm">Could not load.</p>
      ) : (
        <div className="space-y-3">
          {(q.data ?? []).map((d) => (
            <Card key={d.id}>
              <CardHeader>
                <CardTitle className="text-base">{d.departmentName}</CardTitle>
                <CardDescription>
                  {d.organizationName} · {d.position}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    toggle.mutate({
                      id: d.id,
                      deptId: d.departmentId,
                      active: !d.isActive,
                    })
                  }
                >
                  {d.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove your profile in this department?",
                      )
                    ) {
                      del.mutate({ id: d.id, deptId: d.departmentId });
                    }
                  }}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
