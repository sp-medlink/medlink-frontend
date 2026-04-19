import type { Metadata } from "next";
import { PatientRecordsView } from "@/features/patient-records/ui/patient-records-view";

export const metadata: Metadata = {
  title: "Medical records",
};

export default function PatientRecordsPage() {
  return <PatientRecordsView />;
}
