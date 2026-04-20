"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  doctorDepartmentKeys,
  myDoctorDepartmentsOptions,
  removeDoctorFromDepartment,
  setDoctorDeptActive,
  updateMyDoctorDepartment,
} from "@/entities/doctor";
import type { DoctorDepartment } from "@/entities/doctor";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
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
            <DepartmentCard
              key={d.id}
              d={d}
              onToggle={() =>
                toggle.mutate({
                  id: d.id,
                  deptId: d.departmentId,
                  active: !d.isActive,
                })
              }
              onDelete={() => {
                if (
                  window.confirm("Remove your profile in this department?")
                ) {
                  del.mutate({ id: d.id, deptId: d.departmentId });
                }
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function DepartmentCard({
  d,
  onToggle,
  onDelete,
}: {
  d: DoctorDepartment;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const qc = useQueryClient();
  const [minutes, setMinutes] = useState<string>(
    String(d.apptDurationInMinutes),
  );
  const parsed = Number.parseInt(minutes, 10);
  const validMinutes =
    Number.isFinite(parsed) && parsed >= 5 && parsed <= 240;
  const dirty = validMinutes && parsed !== d.apptDurationInMinutes;

  const save = useMutation({
    mutationFn: () =>
      updateMyDoctorDepartment(d.id, {
        position: d.position,
        description: d.description,
        appt_duration_in_minutes: parsed,
      }),
    onSuccess: () => {
      toast.success("Slot duration saved");
      void qc.invalidateQueries({ queryKey: doctorDepartmentKeys.all() });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Could not save");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{d.departmentName}</CardTitle>
        <CardDescription>
          {d.organizationName} · {d.position}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor={`dur-${d.id}`}
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              <Clock className="size-3.5" aria-hidden />
              Slot duration (min)
            </Label>
            <Input
              id={`dur-${d.id}`}
              type="number"
              min={5}
              max={240}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-32"
              disabled={save.isPending}
            />
            {!validMinutes ? (
              <p className="text-destructive text-[11px]">
                Enter a value between 5 and 240 minutes.
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="mr-1.5 size-4" aria-hidden />
            )}
            Save
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-3">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onToggle}
          >
            {d.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
