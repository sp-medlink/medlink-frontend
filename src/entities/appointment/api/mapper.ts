import type { Appointment, AppointmentStatus } from "../model/types";
import type { AppointmentApiDto } from "./dto";

function toStatus(raw: string | undefined): AppointmentStatus {
  switch (raw) {
    case "scheduled":
    case "confirmed":
    case "in_progress":
    case "completed":
    case "cancelled":
    case "no_show":
      return raw;
    default:
      // Defensive — older backend rows default to `scheduled` at
      // migration time, and anything unexpected is safest treated
      // the same so the UI keeps rendering.
      return "scheduled";
  }
}

export function toAppointment(dto: AppointmentApiDto): Appointment {
  return {
    id: dto.id,
    // Doctor-side uses `patient_user_id`; patient-side uses `user_id`. Both
    // name the patient — unify into a single field.
    userId: dto.user_id ?? dto.patient_user_id ?? "",
    patientFirstName: dto.patient_first_name ?? "",
    patientLastName: dto.patient_last_name ?? "",
    patientAvatarPath: dto.patient_avatar_path ?? "",
    doctorDepartmentId: dto.doctor_department_id,
    doctorAvatarPath: dto.doctor_avatar_path ?? "",
    doctorFirstName: dto.doctor_first_name ?? "",
    doctorLastName: dto.doctor_last_name ?? "",
    departmentId: dto.department_id ?? "",
    departmentName: dto.department_name ?? "",
    organizationId: dto.organization_id ?? "",
    organizationName: dto.organization_name ?? "",
    date: dto.date,
    time: dto.time,
    isOnline: dto.is_online,
    isEnabled: dto.is_enabled,
    isOnSchedule: dto.is_on_schedule,
    // Fall back to 30 for older rows that predate the field — matches
    // the backend default slot length used elsewhere.
    apptDurationInMinutes: dto.appt_duration_in_minutes ?? 30,
    status: toStatus(dto.status),
    cancellationReason: dto.cancellation_reason ?? "",
    cancelledBy: dto.cancelled_by ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
