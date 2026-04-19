"use client";

import { useCurrentUser } from "@/entities/session";
import { HomeLandingView } from "@/features/home-landing";

export default function PatientHomePage() {
  const user = useCurrentUser();
  return (
    <HomeLandingView variant="patient" firstName={user?.firstName ?? null} />
  );
}
