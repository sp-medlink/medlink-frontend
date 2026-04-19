export interface ScheduleSlotApiDto {
  id: string;
  doctor_department_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorScheduleListApiResponse {
  schedule: ScheduleSlotApiDto[];
}
