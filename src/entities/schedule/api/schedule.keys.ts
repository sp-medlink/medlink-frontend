export const scheduleKeys = {
  all: () => ["schedule"] as const,
  public: (orgId: string, deptId: string, docDeptId: string) =>
    [...scheduleKeys.all(), "public", orgId, deptId, docDeptId] as const,
  doctor: (docDeptId: string) =>
    [...scheduleKeys.all(), "doctor", docDeptId] as const,
} as const;
