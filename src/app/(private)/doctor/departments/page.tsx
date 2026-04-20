import { redirect } from "next/navigation";

/** Merged into `/doctor/practice` — see the doctor practice page notes. */
export default function DoctorDepartmentsPage() {
  redirect("/doctor/practice#departments");
}
