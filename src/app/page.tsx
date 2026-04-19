import type { Metadata } from "next";
import { HomePageClient } from "@/features/home-landing";

export const metadata: Metadata = {
  title: "Medlink — Telemedicine platform",
  description:
    "Video consultations, scheduling, and secure messaging for patients and clinicians.",
};

export default function Page() {
  return <HomePageClient />;
}
