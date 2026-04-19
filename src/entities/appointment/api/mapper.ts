import type { Appointment } from "../model/types";
import type { AppointmentApiDto } from "./dto";

export function toAppointment(dto: AppointmentApiDto): Appointment {
  return {
    id: dto.id,
    userId: dto.user_id,
    doctorDepartmentId: dto.doctor_department_id,
    doctorAvatarPath: dto.doctor_avatar_path,
    doctorFirstName: dto.doctor_first_name,
    doctorLastName: dto.doctor_last_name,
    departmentId: dto.department_id,
    departmentName: dto.department_name,
    organizationId: dto.organization_id,
    organizationName: dto.organization_name,
    date: dto.date,
    time: dto.time,
    isOnline: dto.is_online,
    isEnabled: dto.is_enabled,
    isOnSchedule: dto.is_on_schedule,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
