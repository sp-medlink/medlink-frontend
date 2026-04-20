import type { Metadata } from "next";
import { PatientAppointmentsView } from "@/features/patient-appointments/ui/patient-appointments-view";

export const metadata: Metadata = {
  title: "Appointments",
};

export default function PatientAppointmentsPage() {
  return <PatientAppointmentsView />;
}
