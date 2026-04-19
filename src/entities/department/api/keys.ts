/**
 * Query key factory for departments. Departments live under three backend
 * prefixes (platform admin, org-admin, dept-admin) with slightly different
 * authz. We scope the list keys by access path so cache entries don't
 * collide between roles.
 */
export const departmentKeys = {
  all: () => ["department"] as const,

  listByOrg: (orgId: string) =>
    [...departmentKeys.all(), "list", "by-org", orgId] as const,

  detailByOrg: (orgId: string, deptId: string) =>
    [...departmentKeys.all(), "detail", "by-org", orgId, deptId] as const,

  detailDeptAdmin: (deptId: string) =>
    [...departmentKeys.all(), "detail", "dept-admin", deptId] as const,
} as const;
