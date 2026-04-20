import type { Metadata } from "next";
import { PatientConsultationsView } from "@/features/patient-consultations/ui/patient-consultations-view";

export const metadata: Metadata = {
  title: "Video visits",
};

export default function PatientConsultationsPage() {
  return <PatientConsultationsView />;
}
