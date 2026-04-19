import type { DoctorDepartment } from "../model/types";
import type { DoctorDepartmentDto } from "./doctor-department.dto";

export function toDoctorDepartment(
  api: DoctorDepartmentDto,
): DoctorDepartment {
  return {
    id: api.id,
    doctorId: api.doctor_id,
    departmentId: api.department_id,
    position: api.position,
    description: api.description,
    apptDurationInMinutes: api.appt_duration_in_minutes,
    isDeptAdmin: api.is_dept_admin,
    rating: api.rating,
    isEnabled: api.is_enabled,
    isActive: api.is_active,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}
