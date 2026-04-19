/**
 * React Query key factory for organization reads.
 *
 * Organizations are readable through two backend prefixes:
 *   - `/user/org-admin/organizations`  — returns orgs the current user is
 *     in `orgs_admins` for.
 *   - `/user/admin/organizations`      — same filter, but requires the `admin`
 *     base role. We key the two separately so a platform admin who is also in
 *     orgs_admins doesn't double-fetch.
 */
export const organizationKeys = {
  all: () => ["organization"] as const,

  listOrgAdmin: () => [...organizationKeys.all(), "list", "org-admin"] as const,
  listPlatform: () => [...organizationKeys.all(), "list", "platform"] as const,

  detail: (orgId: string) =>
    [...organizationKeys.all(), "detail", orgId] as const,
} as const;
