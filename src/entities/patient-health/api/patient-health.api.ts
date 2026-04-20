import { queryOptions } from "@tanstack/react-query";

import { apiFetch } from "@/shared/api";

import type { PatientHealthProfile } from "../model/types";
import type { GetMyHealthResponse, UpdateMyHealthBody } from "./dto";
import { toPatientHealthProfile } from "./mapper";

export const patientHealthKeys = {
  all: () => ["patient-health"] as const,
  mine: () => [...patientHealthKeys.all(), "mine"] as const,
  byAppt: (doctorDeptId: string, appointmentId: string) =>
    [...patientHealthKeys.all(), "by-appt", doctorDeptId, appointmentId] as const,
};

export async function fetchMyHealth(): Promise<PatientHealthProfile> {
  const res = await apiFetch<GetMyHealthResponse>("/user/me/health");
  return toPatientHealthProfile(res.profile);
}

export async function updateMyHealth(
  body: UpdateMyHealthBody,
): Promise<void> {
  await apiFetch<unknown>("/user/me/health", {
    method: "PUT",
    json: body,
  });
}

export function myHealthQuery() {
  return queryOptions({
    queryKey: patientHealthKeys.mine(),
    queryFn: fetchMyHealth,
    // A form-backed resource — 5 min is plenty, most updates come
    // from the user themselves and invalidation handles those.
    staleTime: 5 * 60_000,
  });
}

/**
 * Doctor-side read of a patient's health profile, scoped to an
 * appointment. Backend enforces that the current doctor owns the
 * appointment; returns `null` if the patient never saved a profile.
 */
export async function fetchPatientHealthForAppointment(
  doctorDepartmentId: string,
  appointmentId: string,
): Promise<PatientHealthProfile | null> {
  const res = await apiFetch<{
    profile: GetMyHealthResponse["profile"] | null;
  }>(
    `/user/doctor/departments/${doctorDepartmentId}/appointments/${appointmentId}/patient-health`,
  );
  return res.profile ? toPatientHealthProfile(res.profile) : null;
}

export function patientHealthByApptQuery(
  doctorDepartmentId: string,
  appointmentId: string,
) {
  return queryOptions({
    queryKey: patientHealthKeys.byAppt(doctorDepartmentId, appointmentId),
    queryFn: () =>
      fetchPatientHealthForAppointment(doctorDepartmentId, appointmentId),
    staleTime: 60_000,
  });
}
