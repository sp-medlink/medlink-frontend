import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default function DoctorAppointmentsPage() {
  redirect(routes.doctor.root);
}
