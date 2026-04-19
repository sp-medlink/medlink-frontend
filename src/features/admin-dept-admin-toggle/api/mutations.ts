"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  doctorDepartmentKeys,
  setDoctorDeptAdmin,
} from "@/entities/doctor";

interface SetDeptAdminArgs {
  docDeptId: string;
  isDeptAdmin: boolean;
}

/**
 * Promote or demote a doctor as dept-admin inside a given department.
 * Only org-admins can call this — dept-admins don't manage other dept-admins.
 */
export function useSetDeptAdminMutation(orgId: string, deptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin-dept-admin", "toggle", orgId, deptId],
    mutationFn: ({ docDeptId, isDeptAdmin }: SetDeptAdminArgs) =>
      setDoctorDeptAdmin(orgId, deptId, docDeptId, isDeptAdmin),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorDepartmentKeys.listByOrgDept(orgId, deptId),
      });
    },
  });
}
