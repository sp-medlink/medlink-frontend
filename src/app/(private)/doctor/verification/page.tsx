import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default function DoctorVerificationPage() {
  redirect(routes.doctor.root);
}
