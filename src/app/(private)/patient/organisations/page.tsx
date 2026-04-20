import type { Metadata } from "next";
import { PatientOrganisationsView } from "@/features/patient-organisations/ui/patient-organisations-view";

export const metadata: Metadata = {
  title: "Organizations",
};

export default function PatientOrganisationsPage() {
  return <PatientOrganisationsView />;
}
