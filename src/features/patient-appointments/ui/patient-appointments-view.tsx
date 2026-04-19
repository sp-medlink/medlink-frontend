"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

import { appointmentsListOptions } from "@/entities/appointment";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export function PatientAppointmentsView() {
  const q = useQuery(appointmentsListOptions());

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">My appointments</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Online visits are available in{" "}
          <Link href={routes.patient.consultations} className="text-emerald-600 underline">
            Video consultations
          </Link>
          .
        </p>
      </header>

      {q.isPending ? (
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      ) : q.isError ? (
        <p className="text-destructive text-sm">Could not load appointments.</p>
      ) : (q.data?.length ?? 0) === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="items-center pb-2 text-center">
            <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-2xl">
              <Calendar className="text-muted-foreground size-7" aria-hidden />
            </div>
            <CardTitle className="text-lg">No appointments yet</CardTitle>
            <CardDescription className="max-w-sm text-balance">
              When you book with a doctor, visits will appear here. You can pick
              an organization and department in the directory or go to video
              visits.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 pt-0 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={routes.patient.organisations}>
                Organization directory
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={routes.patient.consultations}>
                Video consultations
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {q.data!.map((a) => (
            <li
              key={a.id}
              className={cn(
                "rounded-xl border px-4 py-3",
                !a.isEnabled && "opacity-60",
              )}
            >
              <p className="font-medium">
                Dr. {a.doctorFirstName} {a.doctorLastName}
              </p>
              <p className="text-muted-foreground text-sm">
                {a.date} · {a.time} · {a.departmentName}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {a.isOnline ? "Online" : "In person"} ·{" "}
                {a.isOnSchedule ? "confirmed" : "pending"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
