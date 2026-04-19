import { apiFetch } from "@/shared/api";

import type { PlatformAdmin } from "../model/types";
import type {
  AddPlatformAdminBody,
  PlatformAdminsListResponse,
} from "./dto";
import { toPlatformAdmin } from "./mapper";

export async function fetchPlatformAdmins(): Promise<PlatformAdmin[]> {
  const res = await apiFetch<PlatformAdminsListResponse>(
    "/user/admin/admins",
  );
  return res.admins.map(toPlatformAdmin);
}

export async function addPlatformAdmin(userId: string): Promise<void> {
  const body: AddPlatformAdminBody = { user_id: userId };
  await apiFetch("/user/admin/admins", { method: "POST", json: body });
}

/**
 * Backend exposes DELETE on `/user/admin/admins/:user_id`, but V3 product
 * rules say the platform admin can only *add* peers, not remove them.
 * Kept here only so the capability exists if the rule is relaxed later —
 * the UI does not surface a remove control.
 */
export async function removePlatformAdmin(userId: string): Promise<void> {
  await apiFetch(`/user/admin/admins/${userId}`, { method: "DELETE" });
}
