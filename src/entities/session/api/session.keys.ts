export const sessionKeys = {
  all: () => ["session"] as const,
  me: () => [...sessionKeys.all(), "me"] as const,
  /** Probe: does the current user have any `orgs_admins` rows? */
  orgAdmin: () => [...sessionKeys.all(), "is-org-admin"] as const,
  /**
   * Probe: does the current user have any `doctors_departments` row with
   * `is_dept_admin = true`? Only issued for users whose base role is `doctor`.
   */
  deptAdmin: () => [...sessionKeys.all(), "is-dept-admin"] as const,
} as const;
