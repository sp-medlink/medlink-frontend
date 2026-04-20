export interface AppointmentApiDto {
  id: string;
  /** Patient-side response: the patient's own user id. */
  user_id?: string;
  /** Doctor-side response: the patient's user id (different field name upstream). */
  patient_user_id?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_avatar_path?: string;
  doctor_department_id: string;
  /** Doctor-facing fields — only populated on the patient-side response. */
  doctor_avatar_path?: string;
  doctor_first_name?: string;
  doctor_last_name?: string;
  department_id?: string;
  department_name?: string;
  organization_id?: string;
  organization_name?: string;
  date: string;
  time: string;
  is_online: boolean;
  is_enabled: boolean;
  is_on_schedule: boolean;
  /** From doctors_departments.appt_duration_in_minutes. */
  appt_duration_in_minutes?: number;
  status?: string;
  cancellation_reason?: string;
  cancelled_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentsHistoryApiResponse {
  appointments: AppointmentApiDto[];
}

export interface AppointmentApiResponse {
  appointment: AppointmentApiDto;
}

export interface CreateAppointmentApiBody {
  doctor_department_id: string;
  date: string;
  time: string;
  is_online: boolean;
}

export interface CreateAppointmentApiResponse {
  appointment_id: string;
}

export interface VideoCallTokenApiResponse {
  token: string;
  url: string;
}

export interface CancelAppointmentApiBody {
  reason: string;
}

export interface SetLifecycleApiBody {
  status: string;
  cancellation_reason?: string;
}
