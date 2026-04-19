"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  appointmentsListOptions,
  fetchVideoCallTokenForAppointment,
} from "@/entities/appointment";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { MedlinkVideoRoom } from "@/shared/ui/medlink-video-room";

export function PatientConsultationsView() {
  const qc = useQueryClient();
  const list = useQuery(appointmentsListOptions());
  const [session, setSession] = useState<{ url: string; token: string } | null>(
    null,
  );

  const join = useMutation({
    mutationFn: (appointmentId: string) =>
      fetchVideoCallTokenForAppointment(appointmentId),
    onSuccess: (data) => {
      setSession({ url: data.url, token: data.token });
    },
    onError: (e) => {
      const msg =
        e instanceof ApiError ? e.message : "Could not join the call";
      toast.error(msg);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["appointment"] });
    },
  });

  const online = (list.data ?? []).filter(
    (a) => a.isOnline && a.isEnabled && a.isOnSchedule,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Video consultations
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect via LiveKit after a confirmed online appointment.
        </p>
      </header>

      {session ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Call</CardTitle>
            <Button type="button" variant="outline" onClick={() => setSession(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <MedlinkVideoRoom
              serverUrl={session.url}
              token={session.token}
              onDisconnected={() => setSession(null)}
              participantRole="patient"
            />
          </CardContent>
        </Card>
      ) : null}

      {list.isPending ? (
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      ) : list.isError ? (
        <p className="text-destructive text-sm">
          Could not load appointments.
          {list.error instanceof ApiError && list.error.message
            ? ` ${list.error.message}`
            : null}
        </p>
      ) : online.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          You don&apos;t have a video call booking yet. When you have a confirmed
          online visit, it will appear here and you can join the call.
        </p>
      ) : (
        <ul className="space-y-3">
          {online.map((a) => (
            <li key={a.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Dr. {a.doctorFirstName} {a.doctorLastName}
                  </CardTitle>
                  <CardDescription>
                    {a.date} · {a.time} · {a.departmentName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    type="button"
                    disabled={join.isPending}
                    onClick={() => join.mutate(a.id)}
                  >
                    {join.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Join"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
