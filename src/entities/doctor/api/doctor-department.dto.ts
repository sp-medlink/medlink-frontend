/**
 * Union DTO for the three `doctor_departments` surfaces:
 *
 *   - `/user/org-admin/...`  → `doctor_department_id`, `user_id`, + full
 *                              doctor profile (name, avatar, education,
 *                              experience) and `department_name`/`organization_name`.
 *   - `/user/dept-admin/...` → same as org-admin minus `user_id`.
 *   - `/user/doctor/departments` → legacy shape: `id`, `doctor_id`, no
 *                                  user profile fields.
 *
 * We normalise in the mapper, so consumers always get `id` / `doctorId`
 * and the enrichment fields come through as optional.
 */
export interface DoctorDepartmentDto {
  id?: string;
  doctor_department_id?: string;
  doctor_id?: string;
  user_id?: string;
  avatar_path?: string;
  first_name?: string;
  last_name?: string;
  education?: string;
  experience?: string;
  department_id: string;
  department_name?: string;
  organization_id?: string;
  organization_name?: string;
  position: string;
  description: string;
  appt_duration_in_minutes: number;
  is_dept_admin: boolean;
  rating: number;
  is_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorDepartmentsListResponse {
  doctor_departments: DoctorDepartmentDto[];
}

/**
 * The doctor's own endpoint (`/user/doctor/departments`) uses a different
 * JSON key than the org-admin/dept-admin listings. Mirrors the quirk in
 * `internal/doctor/me/mydepts/service.go`.
 */
export interface MyDoctorDepartmentsListResponse {
  doctors_departments: DoctorDepartmentDto[];
}

export interface DoctorDepartmentResponse {
  doctor_department: DoctorDepartmentDto;
}

export interface SetDeptAdminBody {
  is_dept_admin: boolean;
}

export interface SetDoctorDeptActiveBody {
  is_active: boolean;
}
