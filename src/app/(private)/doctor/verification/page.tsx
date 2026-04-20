import { redirect } from "next/navigation";

/**
 * Verification is now merged into `/doctor/practice` alongside
 * Departments + Schedule — three nearly-empty pages collapsed into one.
 * Kept as a redirect so existing bookmarks still land in the right
 * section.
 */
export default function DoctorVerificationPage() {
  redirect("/doctor/practice#verification");
}
