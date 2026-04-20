import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default function DoctorConsultationsPage() {
  redirect(routes.doctor.root);
}
