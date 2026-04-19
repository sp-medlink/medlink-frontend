export const adminUserKeys = {
  all: () => ["admin-user"] as const,
  list: () => [...adminUserKeys.all(), "list"] as const,
  detail: (userId: string) => [...adminUserKeys.all(), "detail", userId] as const,
} as const;
