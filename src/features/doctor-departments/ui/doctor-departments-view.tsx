"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteDoctorDepartment,
  doctorDepartmentKeys,
  myDoctorDepartmentsOptions,
  setDoctorDepartmentActive,
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

export function DoctorDepartmentsView() {
  const qc = useQueryClient();
  const q = useQuery(myDoctorDepartmentsOptions());

  const toggle = useMutation({
    mutationFn: (p: { id: string; active: boolean }) =>
      setDoctorDepartmentActive(p.id, p.active),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: doctorDepartmentKeys.all() });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Error");
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteDoctorDepartment(id),
    onSuccess: () => {
      toast.success("Profile removed");
      void qc.invalidateQueries({ queryKey: doctorDepartmentKeys.all() });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Error");
    },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Per-department profiles: status and removal.
        </p>
      </header>

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
                    toggle.mutate({ id: d.id, active: !d.isActive })
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
                      del.mutate(d.id);
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
