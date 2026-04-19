import { queryOptions } from "@tanstack/react-query";

import {
  fetchDepartmentAsDeptAdmin,
  fetchDepartmentByOrg,
  fetchDepartmentsByOrg,
} from "./departments.api";
import { departmentKeys } from "./keys";

export const departmentsByOrgQuery = (orgId: string) =>
  queryOptions({
    queryKey: departmentKeys.listByOrg(orgId),
    queryFn: () => fetchDepartmentsByOrg(orgId),
    staleTime: 30_000,
    enabled: !!orgId,
  });

export const departmentByOrgQuery = (orgId: string, deptId: string) =>
  queryOptions({
    queryKey: departmentKeys.detailByOrg(orgId, deptId),
    queryFn: () => fetchDepartmentByOrg(orgId, deptId),
    staleTime: 30_000,
    enabled: !!orgId && !!deptId,
  });

export const departmentAsDeptAdminQuery = (deptId: string) =>
  queryOptions({
    queryKey: departmentKeys.detailDeptAdmin(deptId),
    queryFn: () => fetchDepartmentAsDeptAdmin(deptId),
    staleTime: 30_000,
    enabled: !!deptId,
  });
