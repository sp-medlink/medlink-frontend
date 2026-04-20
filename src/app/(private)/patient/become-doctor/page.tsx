"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, Stethoscope } from "lucide-react";
import Link from "next/link";

import { myDoctorProfileOptions } from "@/entities/doctor";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { DoctorVerificationView } from "@/features/doctor-verification/ui/doctor-verification-view";

/**
 * Patient-area entry point for applying to become a doctor. Reuses
 * `DoctorVerificationView` under a patient-themed header so plain users
 * never have to wander into the `/doctor/*` tree to submit.
 *
 * Once the user picks up the `doctor` role (pending or approved) the
 * sidebar flips to the doctor area — we also steer them to the full
 * practice page via an inline CTA.
 */
export default function BecomeDoctorPage() {
  const q = useQuery({
    ...myDoctorProfileOptions(),
    retry: false,
  });
  // Only show the "go to practice" CTA once the admin has approved —
  // pending/rejected users have nothing useful to do in the doctor tree.
  const isApproved = q.data?.verificationStatus === "approved";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
      <header className="space-y-2">
        <div className="bg-primary/10 text-primary inline-flex size-11 items-center justify-center rounded-2xl">
          <Stethoscope className="size-5" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Become a doctor on Medlink
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Apply with your license details. A platform admin reviews every
          submission manually — you&apos;ll see the status here. Once
          approved, video tools unlock and you can join departments.
        </p>
      </header>

      {q.isPending ? (
        <Loader2 className="size-6 animate-spin" />
      ) : (
        <>
          <DoctorVerificationView embedded />
          {isApproved ? (
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <p className="mb-2 font-medium">Next steps as a doctor</p>
              <p className="text-muted-foreground mb-3">
                Your practice setup lives in the doctor area — departments,
                schedule, and more.
              </p>
              <Button asChild size="sm">
                <Link href={routes.doctor.practice}>
                  Open doctor practice
                  <ArrowRight className="ml-1.5 size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
