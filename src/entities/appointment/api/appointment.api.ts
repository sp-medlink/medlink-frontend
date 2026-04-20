import { apiFetch } from "@/shared/api";
import type { Appointment, AppointmentStatus } from "../model/types";
import type {
  AppointmentApiDto,
  AppointmentApiResponse,
  AppointmentsHistoryApiResponse,
  CancelAppointmentApiBody,
  CreateAppointmentApiBody,
  CreateAppointmentApiResponse,
  SetLifecycleApiBody,
  VideoCallTokenApiResponse,
} from "./dto";
import { toAppointment } from "./mapper";

export async function fetchMyAppointments(): Promise<Appointment[]> {
  const res = await apiFetch<AppointmentsHistoryApiResponse>("/user/me/appointments");
  // Backend may JSON-encode a nil slice as `null`; `null.map` would throw → query error despite HTTP 200.
  const list = res.appointments ?? [];
  return list.map(toAppointment);
}

export async function fetchMyAppointment(id: string): Promise<Appointment> {
  const res = await apiFetch<AppointmentApiResponse>(`/user/me/appointments/${id}`);
  return toAppointment(res.appointment);
}

export async function createMyAppointment(
  body: CreateAppointmentApiBody,
): Promise<string> {
  const res = await apiFetch<CreateAppointmentApiResponse>("/user/me/appointments", {
    method: "POST",
    json: body,
  });
  return res.appointment_id;
}

export async function fetchVideoCallTokenForAppointment(
  appointmentId: string,
): Promise<VideoCallTokenApiResponse> {
  return apiFetch<VideoCallTokenApiResponse>(
    `/user/me/appointments/${appointmentId}/vc`,
  );
}

export async function fetchDoctorAppointments(
  doctorDepartmentId: string,
  opts?: { dateFrom?: string; dateTo?: string },
): Promise<Appointment[]> {
  const params = new URLSearchParams();
  if (opts?.dateFrom) params.set("date_from", opts.dateFrom);
  if (opts?.dateTo) params.set("date_to", opts.dateTo);
  const q = params.toString();
  const path = `/user/doctor/departments/${doctorDepartmentId}/appointments${q ? `?${q}` : ""}`;
  const res = await apiFetch<{ appointments: AppointmentApiDto[] }>(path);
  return (res.appointments ?? []).map(toAppointment);
}

export async function setDoctorAppointmentOnSchedule(
  doctorDepartmentId: string,
  appointmentId: string,
  isOnSchedule: boolean,
): Promise<void> {
  await apiFetch<unknown>(
    `/user/doctor/departments/${doctorDepartmentId}/appointments/${appointmentId}/status`,
    {
      method: "PATCH",
      json: { is_on_schedule: isOnSchedule },
    },
  );
}

// ----- Lifecycle mutations (migration 000004) ---------------------

/**
 * Patient-side terminal cancel. Requires a non-empty reason — the
 * backend returns 400 otherwise. Keeps the appointment row so the
 * doctor sees it in their history.
 */
export async function cancelMyAppointment(
  appointmentId: string,
  reason: string,
): Promise<void> {
  const body: CancelAppointmentApiBody = { reason };
  await apiFetch<unknown>(`/user/me/appointments/${appointmentId}/cancel`, {
    method: "PATCH",
    json: body,
  });
}

/**
 * Doctor-driven state transition: confirm / in_progress / completed
 * / cancelled / no_show. `cancellationReason` is required by the
 * backend when `status === "cancelled"`.
 */
export async function setDoctorAppointmentLifecycle(
  doctorDepartmentId: string,
  appointmentId: string,
  status: AppointmentStatus,
  cancellationReason?: string,
): Promise<void> {
  const body: SetLifecycleApiBody = {
    status,
    ...(cancellationReason ? { cancellation_reason: cancellationReason } : {}),
  };
  await apiFetch<unknown>(
    `/user/doctor/departments/${doctorDepartmentId}/appointments/${appointmentId}/lifecycle`,
    {
      method: "PATCH",
      json: body,
    },
  );
}

export async function fetchVideoCallTokenForDoctorAppointment(
  doctorDepartmentId: string,
  appointmentId: string,
): Promise<VideoCallTokenApiResponse> {
  return apiFetch<VideoCallTokenApiResponse>(
    `/user/doctor/departments/${doctorDepartmentId}/appointments/${appointmentId}/vc`,
  );
}
