import { apiFetch, ApiError } from "@/shared/api";

/**
 * Resolves "is the current user an admin of at least one organization?".
 *
 * The backend has no single yes/no endpoint for this — org-admin-hood is a
 * row relationship in `orgs_admins`, not a role. `/user/org-admin/organizations`
 * returns every org the current user administers (via the query's implicit
 * `admin_id = current_user` filter), so a non-empty list is our signal.
 *
 * 403/404 → treated as "not an org admin" rather than a hard error.
 */
export async function fetchIsOrgAdmin(): Promise<boolean> {
  try {
    const res = await apiFetch<{ organizations: unknown[] }>(
      "/user/org-admin/organizations",
    );
    return res.organizations.length > 0;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
      return false;
    }
    throw err;
  }
}
