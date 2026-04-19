import { apiFetch } from "@/shared/api";

import type { Doctor } from "../model/types";
import type { DoctorProfileApiResponse } from "./dto";
import { toDoctor } from "./mapper";

export async function fetchMyDoctorProfile(): Promise<Doctor> {
  const res = await apiFetch<DoctorProfileApiResponse>("/user/doctor");
  return toDoctor(res.doctor);
}
