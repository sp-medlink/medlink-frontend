import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default function DoctorSchedulePage() {
  redirect(routes.doctor.root);
}
