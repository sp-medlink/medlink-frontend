"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { myDoctorProfileOptions } from "@/entities/doctor";
import { useCurrentUser } from "@/entities/session";
import { routes } from "@/shared/config";

/**
 * Legacy URL.
 * Doctors with incomplete verification are sent to `/patient` instead.
 */
export default function PatientDoctorsRedirectPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const isDoctor = user?.roles.includes("doctor") ?? false;
  const profile = useQuery({
    ...myDoctorProfileOptions(),
    enabled: isDoctor,
  });

  useEffect(() => {
    if (!isDoctor) {
      router.replace(routes.patient.organisations);
      return;
    }
    if (profile.isPending) return;
    if (profile.data?.verificationStatus !== "approved") {
      router.replace(routes.patient.root);
      return;
    }
    router.replace(routes.patient.organisations);
  }, [isDoctor, profile.isPending, profile.data?.verificationStatus, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
    </main>
  );
}
