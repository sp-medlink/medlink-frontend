import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default function PatientOrganisationsPage() {
  redirect(routes.patient.root);
}
