export interface AppointmentApiDto {
  id: string;
  user_id: string;
  doctor_department_id: string;
  doctor_avatar_path: string;
  doctor_first_name: string;
  doctor_last_name: string;
  department_id: string;
  department_name: string;
  organization_id: string;
  organization_name: string;
  date: string;
  time: string;
  is_online: boolean;
  is_enabled: boolean;
  is_on_schedule: boolean;
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
