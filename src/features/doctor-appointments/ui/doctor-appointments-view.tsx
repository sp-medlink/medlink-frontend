"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  appointmentKeys,
  fetchDoctorAppointments,
  fetchVideoCallTokenForDoctorAppointment,
  setDoctorAppointmentOnSchedule,
} from "@/entities/appointment";
import { myDoctorDepartmentsOptions, myDoctorProfileOptions } from "@/entities/doctor";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { MedlinkVideoRoom } from "@/shared/ui/medlink-video-room";

export function DoctorAppointmentsView() {
  const qc = useQueryClient();
  const profile = useQuery(myDoctorProfileOptions());
  const depts = useQuery(myDoctorDepartmentsOptions());
  const [docDeptId, setDocDeptId] = useState<string | null>(null);
  const appts = useQuery({
    queryKey: [...appointmentKeys.list(), "doctor", docDeptId ?? ""],
    queryFn: () => fetchDoctorAppointments(docDeptId!),
    enabled: Boolean(docDeptId),
  });

  const [session, setSession] = useState<{ url: string; token: string } | null>(
    null,
  );

  const toggle = useMutation({
    mutationFn: (p: { apptId: string; on: boolean }) =>
      setDoctorAppointmentOnSchedule(docDeptId!, p.apptId, p.on),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: appointmentKeys.all() });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Error");
    },
  });

  const join = useMutation({
    mutationFn: (apptId: string) =>
      fetchVideoCallTokenForDoctorAppointment(docDeptId!, apptId),
    onSuccess: (data) => setSession({ url: data.url, token: data.token }),
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Video error");
    },
  });

  const verified =
    profile.data?.verificationStatus === "approved";

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        {!verified ? (
          <p className="text-amber-600 mt-2 text-sm">
            Video is available after your doctor verification is approved.
          </p>
        ) : (
          <p className="text-muted-foreground mt-1 text-sm">
            Manage on-schedule status and video for online appointments.
          </p>
        )}
      </header>

      {session ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Video</CardTitle>
            <Button type="button" variant="outline" onClick={() => setSession(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <MedlinkVideoRoom
              serverUrl={session.url}
              token={session.token}
              onDisconnected={() => setSession(null)}
            />
          </CardContent>
        </Card>
      ) : null}

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
        appts.isPending ? (
          <Loader2 className="size-8 animate-spin" />
        ) : (
          <ul className="space-y-2">
            {(appts.data ?? []).map((a) => (
              <li key={a.id} className="rounded-xl border px-4 py-3">
                <p className="font-medium">
                  {a.date} · {a.time}
                </p>
                <p className="text-muted-foreground text-sm">
                  {a.isOnline ? "Online" : "In person"} ·{" "}
                  {a.isOnSchedule ? "on schedule" : "off schedule"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      toggle.mutate({ apptId: a.id, on: !a.isOnSchedule })
                    }
                  >
                    {a.isOnSchedule ? "Remove from schedule" : "Add to schedule"}
                  </Button>
                  {a.isOnline && verified ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => join.mutate(a.id)}
                      disabled={join.isPending}
                    >
                      Video
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </main>
  );
}
