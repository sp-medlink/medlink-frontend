import { redirect } from "next/navigation";

import { routes } from "@/shared/config";

/** Legacy URL — redirect to the organization directory. */
export default function PatientDoctorsRedirectPage() {
  redirect(routes.patient.organisations);
}
