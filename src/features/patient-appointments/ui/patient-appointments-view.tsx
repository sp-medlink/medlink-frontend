"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Calendar, Loader2, Sparkles, Video } from "lucide-react";
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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          My appointments
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Online visits are available in{" "}
          <Link
            href={routes.patient.consultations}
            className="text-primary font-medium underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
          >
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
        <Card className="relative overflow-hidden border-dashed bg-card/95 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <div className="pointer-events-none absolute -top-16 right-0 size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 size-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <CardHeader className="relative items-center pb-3 text-center">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium">
              <Sparkles className="text-primary size-3.5" aria-hidden />
              Your booking space is ready
            </div>
            <div className="bg-muted/80 mb-4 flex size-16 items-center justify-center rounded-2xl border shadow-inner">
              <Calendar className="text-muted-foreground size-8" aria-hidden />
            </div>
            <CardTitle className="text-3xl tracking-tight">No appointments yet</CardTitle>
            <CardDescription className="max-w-2xl text-balance text-base leading-relaxed">
              When you book with a doctor, visits will appear here. You can pick
              an organization and department in the directory or go to video
              visits.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-col items-center gap-6 pt-0">
            <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border bg-background/75 px-3 py-2 text-sm">
                <Building2 className="text-primary size-4" aria-hidden />
                <span>Find organization and department</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-background/75 px-3 py-2 text-sm">
                <Video className="text-primary size-4" aria-hidden />
                <span>Join online visits when confirmed</span>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="group min-w-[220px]" asChild>
              <Link href={routes.patient.organisations}>
                Organization directory
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[220px]" asChild>
              <Link href={routes.patient.consultations}>
                Video consultations
              </Link>
            </Button>
            </div>
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
