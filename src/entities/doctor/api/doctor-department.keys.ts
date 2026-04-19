export const doctorDepartmentKeys = {
  all: () => ["doctor-department"] as const,

  listByOrgDept: (orgId: string, deptId: string) =>
    [
      ...doctorDepartmentKeys.all(),
      "list",
      "by-org",
      orgId,
      deptId,
    ] as const,

  listByDeptAdmin: (deptId: string) =>
    [...doctorDepartmentKeys.all(), "list", "dept-admin", deptId] as const,

  /** All `doctor_departments` rows for the current user. */
  listMine: () => [...doctorDepartmentKeys.all(), "list", "mine"] as const,
} as const;
