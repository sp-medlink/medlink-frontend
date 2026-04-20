import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default function PatientConsultationsPage() {
  redirect(routes.patient.root);
}
