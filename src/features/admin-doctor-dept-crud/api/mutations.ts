"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  doctorDepartmentKeys,
  removeDoctorFromDepartment,
  setDoctorDeptActive,
} from "@/entities/doctor";

/**
 * Toggle `is_active` on a single `doctor_departments` row.
 * Dept-admin-scope: uses `/user/dept-admin/*` which requires the caller
 * to be a dept-admin of the parent department.
 */
export function useSetDoctorDeptActiveMutation(deptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-doctor-dept", "toggle-active", deptId],
    mutationFn: ({
      docDeptId,
      isActive,
    }: {
      docDeptId: string;
      isActive: boolean;
    }) => setDoctorDeptActive(deptId, docDeptId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorDepartmentKeys.listByDeptAdmin(deptId),
      });
    },
  });
}

/**
 * Remove a doctor from the department entirely. Dept-admin-scoped.
 */
export function useRemoveDoctorFromDepartmentMutation(deptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-doctor-dept", "remove", deptId],
    mutationFn: (docDeptId: string) =>
      removeDoctorFromDepartment(deptId, docDeptId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorDepartmentKeys.listByDeptAdmin(deptId),
      });
    },
  });
}
