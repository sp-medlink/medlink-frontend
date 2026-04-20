import { apiFetch } from "@/shared/api";

import type { Doctor } from "../model/types";
import type { DoctorProfileApiResponse } from "./dto";
import { toDoctor } from "./mapper";

export async function fetchMyDoctorProfile(): Promise<Doctor> {
  const res = await apiFetch<DoctorProfileApiResponse>("/user/doctor");
  return toDoctor(res.doctor);
}

export interface SubmitDoctorProfileBody {
  education: string;
  experience: string;
  license_number: string;
  license_country: string;
  /** `YYYY-MM-DD`. */
  license_issued_at: string;
  /** `YYYY-MM-DD`. */
  license_expires_at: string;
}

/**
 * Submit (or resubmit) own doctor profile. Backend handles first-time
 * submission and resubmission-after-rejection through the same POST.
 */
export async function submitMyDoctorProfile(
  body: SubmitDoctorProfileBody,
): Promise<void> {
  await apiFetch<unknown>("/user/doctor", {
    method: "POST",
    json: body,
  });
}
