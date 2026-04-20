import type { Metadata } from "next";
import { DoctorAppointmentsView } from "@/features/doctor-appointments/ui/doctor-appointments-view";

export const metadata: Metadata = {
  title: "Appointments",
};

export default function DoctorAppointmentsPage() {
  return <DoctorAppointmentsView />;
}
