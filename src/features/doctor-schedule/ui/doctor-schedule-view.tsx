"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { myDoctorDepartmentsOptions } from "@/entities/doctor";
import {
  createDoctorScheduleSlot,
  deleteDoctorScheduleSlot,
  doctorScheduleOptions,
  scheduleKeys,
  setDoctorScheduleActive,
} from "@/entities/schedule";
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

const WD: { v: number; l: string }[] = [
  { v: 1, l: "Mon" },
  { v: 2, l: "Tue" },
  { v: 3, l: "Wed" },
  { v: 4, l: "Thu" },
  { v: 5, l: "Fri" },
  { v: 6, l: "Sat" },
  { v: 0, l: "Sun" },
];

function toTimePayload(raw: string): string {
  const t = raw.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  return t;
}

export function DoctorScheduleView() {
  const qc = useQueryClient();
  const depts = useQuery(myDoctorDepartmentsOptions());
  const [docDeptId, setDocDeptId] = useState<string | null>(null);
  const schedule = useQuery({
    ...doctorScheduleOptions(docDeptId ?? ""),
    enabled: Boolean(docDeptId),
  });

  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const createM = useMutation({
    mutationFn: () =>
      createDoctorScheduleSlot(docDeptId!, {
        weekday,
        start_time: toTimePayload(start),
        end_time: toTimePayload(end),
      }),
    onSuccess: () => {
      toast.success("Slot added");
      void qc.invalidateQueries({ queryKey: scheduleKeys.all() });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Error");
    },
  });

  const toggleM = useMutation({
    mutationFn: (p: { id: string; active: boolean }) =>
      setDoctorScheduleActive(docDeptId!, p.id, p.active),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: scheduleKeys.all() });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Error");
    },
  });

  const delM = useMutation({
    mutationFn: (id: string) => deleteDoctorScheduleSlot(docDeptId!, id),
    onSuccess: () => {
      toast.success("Removed");
      void qc.invalidateQueries({ queryKey: scheduleKeys.all() });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Error");
    },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Active slots are available for patients to book.
        </p>
      </header>

      {depts.isPending ? (
        <Loader2 className="size-8 animate-spin" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {(depts.data ?? []).map((d) => (
            <Button
              key={d.id}
              type="button"
              variant={docDeptId === d.id ? "default" : "outline"}
              size="sm"
              onClick={() => setDocDeptId(d.id)}
            >
              {d.departmentName}
            </Button>
          ))}
        </div>
      )}

      {docDeptId ? (
        <Card>
          <CardHeader>
            <CardTitle>New slot</CardTitle>
            <CardDescription>Weekday and time range</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Day</Label>
              <select
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
              >
                {WD.map((w) => (
                  <option key={w.v} value={w.v}>
                    {w.l}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Start</Label>
              <Input
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>End</Label>
              <Input value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                disabled={createM.isPending}
                onClick={() => createM.mutate()}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {docDeptId ? (
        <Card>
          <CardHeader>
            <CardTitle>Slots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {schedule.isPending ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              (schedule.data ?? []).map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <span className="text-sm">
                    {WD.find((x) => x.v === s.weekday)?.l ?? s.weekday}{" "}
                    {s.startTime}–{s.endTime}{" "}
                    <span className="text-muted-foreground">
                      {s.isActive ? "active" : "off"}
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        toggleM.mutate({ id: s.id, active: !s.isActive })
                      }
                    >
                      {s.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Delete this slot?")) delM.mutate(s.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
