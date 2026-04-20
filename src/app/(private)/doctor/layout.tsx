import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RequireAnyRole } from "@/entities/session";

export const metadata: Metadata = {
  title: { default: "Doctor · Medlink", template: "%s · Doctor · Medlink" },
};

/**
 * The doctor area is reachable by both `doctor` (verified or pending)
 * and plain `user` — because `/doctor/verification` is the onboarding
 * step a user takes *before* they hold the `doctor` role. Individual
 * pages guard their own contents (e.g. the home dashboard nudges
 * unverified users to the verification page).
 */
export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAnyRole roles={["user", "doctor"]}>{children}</RequireAnyRole>
  );
}
