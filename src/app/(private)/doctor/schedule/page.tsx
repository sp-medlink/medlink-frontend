import { redirect } from "next/navigation";

/** Merged into `/doctor/practice` — see the doctor practice page notes. */
export default function DoctorSchedulePage() {
  redirect("/doctor/practice#schedule");
}
