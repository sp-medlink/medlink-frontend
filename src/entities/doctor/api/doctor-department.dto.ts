export interface DoctorDepartmentDto {
  id: string;
  doctor_id: string;
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
