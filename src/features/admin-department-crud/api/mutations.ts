"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createDepartment,
  deleteDepartment,
  departmentKeys,
  setDepartmentActiveAsDeptAdmin,
  setDepartmentActiveByOrg,
  updateDepartmentAsDeptAdmin,
  updateDepartmentByOrg,
  type DepartmentMutateBody,
} from "@/entities/department";

export function useCreateDepartmentMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-department", "create", orgId],
    mutationFn: (body: DepartmentMutateBody) => createDepartment(orgId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: departmentKeys.listByOrg(orgId),
      });
    },
  });
}

export function useUpdateDepartmentAsOrgAdminMutation(
  orgId: string,
  deptId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-department", "update-org", orgId, deptId],
    mutationFn: (body: DepartmentMutateBody) =>
      updateDepartmentByOrg(orgId, deptId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: departmentKeys.listByOrg(orgId),
      });
      void queryClient.invalidateQueries({
        queryKey: departmentKeys.detailByOrg(orgId, deptId),
      });
    },
  });
}

export function useUpdateDepartmentAsDeptAdminMutation(deptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-department", "update-dept", deptId],
    mutationFn: (body: DepartmentMutateBody) =>
      updateDepartmentAsDeptAdmin(deptId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: departmentKeys.detailDeptAdmin(deptId),
      });
    },
  });
}

export function useDeleteDepartmentMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-department", "delete", orgId],
    mutationFn: (deptId: string) => deleteDepartment(orgId, deptId),
    onSuccess: (_, deptId) => {
      queryClient.removeQueries({
        queryKey: departmentKeys.detailByOrg(orgId, deptId),
      });
      void queryClient.invalidateQueries({
        queryKey: departmentKeys.listByOrg(orgId),
      });
    },
  });
}

export function useSetDepartmentActiveAsOrgAdminMutation(
  orgId: string,
  deptId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-department", "toggle-active-org", orgId, deptId],
    mutationFn: (isActive: boolean) =>
      setDepartmentActiveByOrg(orgId, deptId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: departmentKeys.listByOrg(orgId),
      });
      void queryClient.invalidateQueries({
        queryKey: departmentKeys.detailByOrg(orgId, deptId),
      });
    },
  });
}

export function useSetDepartmentActiveAsDeptAdminMutation(deptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-department", "toggle-active-dept", deptId],
    mutationFn: (isActive: boolean) =>
      setDepartmentActiveAsDeptAdmin(deptId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: departmentKeys.detailDeptAdmin(deptId),
      });
    },
  });
}
