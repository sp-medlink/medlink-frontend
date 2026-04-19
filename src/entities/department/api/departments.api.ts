import { apiFetch } from "@/shared/api";

import type { Department } from "../model/types";
import type {
  CreateDepartmentResponse,
  DepartmentMutateBody,
  DepartmentResponse,
  DepartmentStatusBody,
  DepartmentsListResponse,
} from "./dto";
import { toDepartment } from "./mapper";

// ----- Org-scoped (org-admin + platform-admin use the same shape) -----

export async function fetchDepartmentsByOrg(
  orgId: string,
): Promise<Department[]> {
  const res = await apiFetch<DepartmentsListResponse>(
    `/user/org-admin/organizations/${orgId}/departments`,
  );
  return res.departments.map(toDepartment);
}

export async function fetchDepartmentByOrg(
  orgId: string,
  deptId: string,
): Promise<Department> {
  const res = await apiFetch<DepartmentResponse>(
    `/user/org-admin/organizations/${orgId}/departments/${deptId}`,
  );
  return toDepartment(res.department);
}

export async function createDepartment(
  orgId: string,
  body: DepartmentMutateBody,
): Promise<string> {
  const res = await apiFetch<CreateDepartmentResponse>(
    `/user/org-admin/organizations/${orgId}/departments`,
    { method: "POST", json: body },
  );
  return res.department_id;
}

export async function updateDepartmentByOrg(
  orgId: string,
  deptId: string,
  body: DepartmentMutateBody,
): Promise<void> {
  await apiFetch(
    `/user/org-admin/organizations/${orgId}/departments/${deptId}`,
    { method: "PUT", json: body },
  );
}

export async function deleteDepartment(
  orgId: string,
  deptId: string,
): Promise<void> {
  await apiFetch(
    `/user/org-admin/organizations/${orgId}/departments/${deptId}`,
    { method: "DELETE" },
  );
}

export async function setDepartmentActiveByOrg(
  orgId: string,
  deptId: string,
  isActive: boolean,
): Promise<void> {
  const body: DepartmentStatusBody = { is_active: isActive };
  await apiFetch(
    `/user/org-admin/organizations/${orgId}/departments/${deptId}/status`,
    { method: "PATCH", json: body },
  );
}

// ----- Dept-admin-scoped -----

export async function fetchDepartmentAsDeptAdmin(
  deptId: string,
): Promise<Department> {
  const res = await apiFetch<DepartmentResponse>(
    `/user/dept-admin/departments/${deptId}`,
  );
  return toDepartment(res.department);
}

export async function updateDepartmentAsDeptAdmin(
  deptId: string,
  body: DepartmentMutateBody,
): Promise<void> {
  await apiFetch(`/user/dept-admin/departments/${deptId}`, {
    method: "PUT",
    json: body,
  });
}

export async function setDepartmentActiveAsDeptAdmin(
  deptId: string,
  isActive: boolean,
): Promise<void> {
  const body: DepartmentStatusBody = { is_active: isActive };
  await apiFetch(`/user/dept-admin/departments/${deptId}/status`, {
    method: "PATCH",
    json: body,
  });
}
