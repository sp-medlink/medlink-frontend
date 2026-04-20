import { queryOptions } from "@tanstack/react-query";

import {
  fetchDoctorDepartmentsAsDeptAdmin,
  fetchDoctorDepartmentsByOrgDept,
  fetchMyDoctorDepartments,
} from "./doctor-department.api";
import { doctorDepartmentKeys } from "./doctor-department.keys";

export const doctorDepartmentsByOrgDeptQuery = (
  orgId: string,
  deptId: string,
) =>
  queryOptions({
    queryKey: doctorDepartmentKeys.listByOrgDept(orgId, deptId),
    queryFn: () => fetchDoctorDepartmentsByOrgDept(orgId, deptId),
    staleTime: 30_000,
    enabled: !!orgId && !!deptId,
  });

export const doctorDepartmentsAsDeptAdminQuery = (deptId: string) =>
  queryOptions({
    queryKey: doctorDepartmentKeys.listByDeptAdmin(deptId),
    queryFn: () => fetchDoctorDepartmentsAsDeptAdmin(deptId),
    staleTime: 30_000,
    enabled: !!deptId,
  });

export const myDoctorDepartmentsQuery = () =>
  queryOptions({
    queryKey: doctorDepartmentKeys.listMine(),
    queryFn: fetchMyDoctorDepartments,
    staleTime: 30_000,
  });

// Alias for callers that prefer the `*Options` naming convention
// used elsewhere in the codebase.
export const myDoctorDepartmentsOptions = myDoctorDepartmentsQuery;
