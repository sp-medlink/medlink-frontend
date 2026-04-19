import { apiFetch } from "@/shared/api";

import type { DoctorDepartment } from "../model/types";
import type {
  DoctorDepartmentsListResponse,
  MyDoctorDepartmentsListResponse,
  SetDeptAdminBody,
  SetDoctorDeptActiveBody,
} from "./doctor-department.dto";
import { toDoctorDepartment } from "./doctor-department.mapper";

// ----- Doctor-scoped (my own doctor-department rows) -----

/**
 * Returns every `doctor_departments` row owned by the current user.
 * Used by the dept-admin landing to discover which departments I admin
 * (filter client-side by `isDeptAdmin && isActive`). No dedicated
 * dept-admin list endpoint exists on the backend — this is the
 * canonical "my memberships" call.
 */
export async function fetchMyDoctorDepartments(): Promise<DoctorDepartment[]> {
  const res = await apiFetch<MyDoctorDepartmentsListResponse>(
    `/user/doctor/departments`,
  );
  return res.doctors_departments.map(toDoctorDepartment);
}

// ----- Org-admin-scoped (list + promote to dept-admin) -----

export async function fetchDoctorDepartmentsByOrgDept(
  orgId: string,
  deptId: string,
): Promise<DoctorDepartment[]> {
  const res = await apiFetch<DoctorDepartmentsListResponse>(
    `/user/org-admin/organizations/${orgId}/departments/${deptId}/doctors`,
  );
  return res.doctor_departments.map(toDoctorDepartment);
}

/**
 * Promote or demote a doctor's `is_dept_admin` flag. Only org-admins can
 * call this — dept-admins cannot manage other dept-admins.
 */
export async function setDoctorDeptAdmin(
  orgId: string,
  deptId: string,
  docDeptId: string,
  isDeptAdmin: boolean,
): Promise<void> {
  const body: SetDeptAdminBody = { is_dept_admin: isDeptAdmin };
  await apiFetch(
    `/user/org-admin/organizations/${orgId}/departments/${deptId}/doctors/${docDeptId}/admin`,
    { method: "PATCH", json: body },
  );
}

// ----- Dept-admin-scoped (toggle active + remove) -----

export async function fetchDoctorDepartmentsAsDeptAdmin(
  deptId: string,
): Promise<DoctorDepartment[]> {
  const res = await apiFetch<DoctorDepartmentsListResponse>(
    `/user/dept-admin/departments/${deptId}/doctors`,
  );
  return res.doctor_departments.map(toDoctorDepartment);
}

export async function setDoctorDeptActive(
  deptId: string,
  docDeptId: string,
  isActive: boolean,
): Promise<void> {
  const body: SetDoctorDeptActiveBody = { is_active: isActive };
  await apiFetch(
    `/user/dept-admin/departments/${deptId}/doctors/${docDeptId}/status`,
    { method: "PATCH", json: body },
  );
}

export async function removeDoctorFromDepartment(
  deptId: string,
  docDeptId: string,
): Promise<void> {
  await apiFetch(
    `/user/dept-admin/departments/${deptId}/doctors/${docDeptId}`,
    { method: "DELETE" },
  );
}
