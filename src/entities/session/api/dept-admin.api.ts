import { apiFetch, ApiError } from "@/shared/api";

interface DoctorDepartmentRow {
  is_dept_admin: boolean;
}

interface DoctorDepartmentsResponse {
  doctors_departments: DoctorDepartmentRow[];
}

/**
 * Resolves "is the current user a dept-admin of at least one department?".
 *
 * Dept-admin-hood isn't a role — it's a boolean column on the
 * `doctors_departments` link row. Only doctors can ever be dept-admins, so
 * callers should gate on `baseAppRole === "doctor"` before invoking this.
 *
 * 403/404 → treated as "not a dept admin" (covers the "user isn't a doctor
 * yet" case cleanly without a pre-check).
 */
export async function fetchIsDeptAdmin(): Promise<boolean> {
  try {
    const res = await apiFetch<DoctorDepartmentsResponse>(
      "/user/doctor/departments",
    );
    return res.doctors_departments.some((row) => row.is_dept_admin);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
      return false;
    }
    throw err;
  }
}
