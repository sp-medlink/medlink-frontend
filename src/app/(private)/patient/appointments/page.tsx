import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default function PatientAppointmentsPage() {
  redirect(routes.patient.root);
}
