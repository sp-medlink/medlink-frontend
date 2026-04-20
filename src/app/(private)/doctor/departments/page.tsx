import { redirect } from "next/navigation";
import { routes } from "@/shared/config";

export default function DoctorDepartmentsPage() {
  redirect(routes.doctor.root);
}
