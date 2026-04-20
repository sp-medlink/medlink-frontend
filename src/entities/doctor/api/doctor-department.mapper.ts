import type { DoctorDepartment } from "../model/types";
import type { DoctorDepartmentDto } from "./doctor-department.dto";

/**
 * Normalises the three backend shapes. The org-admin + dept-admin
 * surfaces use `doctor_department_id` as the primary key and expose
 * profile enrichment (name, avatar, education, etc). The doctor's own
 * listing uses legacy `id`/`doctor_id`. We prefer the enriched key when
 * available so UI keys and action URLs stay correct across scopes.
 */
export function toDoctorDepartment(
  api: DoctorDepartmentDto,
): DoctorDepartment {
  return {
    id: api.doctor_department_id ?? api.id ?? "",
    doctorId: api.doctor_id ?? "",
    departmentId: api.department_id,
    departmentName: api.department_name ?? "",
    organizationId: api.organization_id ?? "",
    organizationName: api.organization_name ?? "",
    position: api.position,
    description: api.description,
    apptDurationInMinutes: api.appt_duration_in_minutes,
    isDeptAdmin: api.is_dept_admin,
    rating: api.rating,
    isEnabled: api.is_enabled,
    isActive: api.is_active,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
    userId: api.user_id,
    avatarPath: api.avatar_path,
    firstName: api.first_name,
    lastName: api.last_name,
    education: api.education,
    experience: api.experience,
  };
}
