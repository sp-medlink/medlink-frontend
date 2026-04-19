import { apiFetch } from "@/shared/api";

import type { ScheduleSlot } from "../model/types";
import type { DoctorScheduleListApiResponse } from "./dto";
import { toScheduleSlot } from "./mapper";

/** Patient-visible slots (backend returns active schedule only). */
export async function fetchPublicDoctorSchedule(
  organizationId: string,
  departmentId: string,
  doctorDepartmentId: string,
): Promise<ScheduleSlot[]> {
  const res = await apiFetch<DoctorScheduleListApiResponse>(
    `/organizations/${organizationId}/departments/${departmentId}/doctors/${doctorDepartmentId}/schedule`,
  );
  return (res.schedule ?? []).map(toScheduleSlot);
}

export async function fetchDoctorSchedule(
  doctorDepartmentId: string,
): Promise<ScheduleSlot[]> {
  const res = await apiFetch<DoctorScheduleListApiResponse>(
    `/user/doctor/departments/${doctorDepartmentId}/schedule`,
  );
  return (res.schedule ?? []).map(toScheduleSlot);
}

export async function createDoctorScheduleSlot(
  doctorDepartmentId: string,
  body: { weekday: number; start_time: string; end_time: string },
): Promise<void> {
  await apiFetch<unknown>(
    `/user/doctor/departments/${doctorDepartmentId}/schedule`,
    { method: "POST", json: body },
  );
}

export async function updateDoctorScheduleSlot(
  doctorDepartmentId: string,
  scheduleId: string,
  body: { weekday: number; start_time: string; end_time: string },
): Promise<void> {
  await apiFetch<unknown>(
    `/user/doctor/departments/${doctorDepartmentId}/schedule/${scheduleId}`,
    { method: "PUT", json: body },
  );
}

export async function deleteDoctorScheduleSlot(
  doctorDepartmentId: string,
  scheduleId: string,
): Promise<void> {
  await apiFetch<unknown>(
    `/user/doctor/departments/${doctorDepartmentId}/schedule/${scheduleId}`,
    { method: "DELETE" },
  );
}

export async function setDoctorScheduleActive(
  doctorDepartmentId: string,
  scheduleId: string,
  isActive: boolean,
): Promise<void> {
  await apiFetch<unknown>(
    `/user/doctor/departments/${doctorDepartmentId}/schedule/${scheduleId}/status`,
    {
      method: "PATCH",
      json: { is_active: isActive },
    },
  );
}
