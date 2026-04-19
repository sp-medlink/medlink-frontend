export const orgAdminKeys = {
  all: () => ["org-admin"] as const,
  listByOrg: (orgId: string) =>
    [...orgAdminKeys.all(), "list", orgId] as const,
} as const;
