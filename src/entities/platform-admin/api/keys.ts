export const platformAdminKeys = {
  all: () => ["platform-admin"] as const,
  list: () => [...platformAdminKeys.all(), "list"] as const,
} as const;
