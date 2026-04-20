import { apiFetch, ApiError } from "@/shared/api";

import type { Organization } from "../model/types";
import type {
  CreateOrganizationResponse,
  OrganizationMutateBody,
  OrganizationResponse,
  OrganizationStatusBody,
  OrganizationsListResponse,
  PlatformCreateOrganizationBody,
} from "./dto";
import { toOrganization } from "./mapper";

/**
 * Fetches orgs the current user administers.
 *
 * Pass `scope: "platform"` to hit `/user/admin/*` — only works for users with
 * the `admin` base role. Defaults to `org-admin` scope which any user can try;
 * 403 collapses to an empty list so UI code doesn't special-case it.
 */
export async function fetchOrganizations(
  scope: "org-admin" | "platform" = "org-admin",
): Promise<Organization[]> {
  const path =
    scope === "platform"
      ? "/user/admin/organizations"
      : "/user/org-admin/organizations";
  try {
    const res = await apiFetch<OrganizationsListResponse>(path);
    return res.organizations.map(toOrganization);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
      return [];
    }
    throw err;
  }
}

/**
 * Fetches a single org by id.
 *
 * Goes through `/user/org-admin/*`. The service-layer ownership check
 * accepts both org-admins (via an `orgs_admins` row) and platform
 * admins (via the `admin` base role), so this is the right path for
 * every admin surface — no scope split needed.
 */
export async function fetchOrganization(orgId: string): Promise<Organization> {
  const res = await apiFetch<OrganizationResponse>(
    `/user/org-admin/organizations/${orgId}`,
  );
  return toOrganization(res.organization);
}

export async function createOrganization(
  body: OrganizationMutateBody,
): Promise<string> {
  const res = await apiFetch<CreateOrganizationResponse>(
    "/user/org-admin/organizations",
    { method: "POST", json: body },
  );
  return res.organization_id;
}

/**
 * Platform-admin scope. Creates an org and assigns its initial admin in
 * a single transaction. The caller does not become an admin of the org.
 * See `POST /user/admin/organizations` in the Go service.
 */
export async function createOrganizationAsPlatformAdmin(
  body: PlatformCreateOrganizationBody,
): Promise<string> {
  const res = await apiFetch<CreateOrganizationResponse>(
    "/user/admin/organizations",
    { method: "POST", json: body },
  );
  return res.organization_id;
}

export async function updateOrganization(
  orgId: string,
  body: OrganizationMutateBody,
): Promise<void> {
  await apiFetch(`/user/org-admin/organizations/${orgId}`, {
    method: "PUT",
    json: body,
  });
}

export async function deleteOrganization(orgId: string): Promise<void> {
  await apiFetch(`/user/org-admin/organizations/${orgId}`, {
    method: "DELETE",
  });
}

export async function setOrganizationActive(
  orgId: string,
  isActive: boolean,
): Promise<void> {
  const body: OrganizationStatusBody = { is_active: isActive };
  await apiFetch(`/user/org-admin/organizations/${orgId}/status`, {
    method: "PATCH",
    json: body,
  });
}
