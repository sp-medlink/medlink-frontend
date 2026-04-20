import type { Metadata } from "next";
import { DoctorPatientsView } from "@/features/doctor-patients";

export const metadata: Metadata = {
  title: "Patients",
};

export default function DoctorPatientsPage() {
  return <DoctorPatientsView />;
}
