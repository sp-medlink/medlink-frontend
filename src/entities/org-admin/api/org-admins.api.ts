import { apiFetch } from "@/shared/api";

import type { OrgAdmin } from "../model/types";
import type { AddOrgAdminBody, OrgAdminsListResponse } from "./dto";
import { toOrgAdmin } from "./mapper";

/**
 * Lists org-admins for an organization.
 *
 * Platform admins can use either the org-admin prefix (their `orgs_admins`
 * membership grants access) or the platform prefix; we use the org-admin
 * prefix to keep the code path uniform.
 */
export async function fetchOrgAdmins(orgId: string): Promise<OrgAdmin[]> {
  const res = await apiFetch<OrgAdminsListResponse>(
    `/user/org-admin/organizations/${orgId}/admins`,
  );
  return res.admins.map(toOrgAdmin);
}

export async function addOrgAdmin(
  orgId: string,
  userId: string,
): Promise<void> {
  const body: AddOrgAdminBody = { user_id: userId };
  await apiFetch(`/user/org-admin/organizations/${orgId}/admins`, {
    method: "POST",
    json: body,
  });
}

export async function removeOrgAdmin(
  orgId: string,
  userId: string,
): Promise<void> {
  await apiFetch(
    `/user/org-admin/organizations/${orgId}/admins/${userId}`,
    { method: "DELETE" },
  );
}
