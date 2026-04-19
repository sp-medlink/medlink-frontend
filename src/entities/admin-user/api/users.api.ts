import { apiFetch } from "@/shared/api";

import type { AdminUser } from "../model/types";
import type { AdminUserResponse, AdminUsersListResponse } from "./dto";
import { toAdminUser } from "./mapper";

/**
 * Platform-admin list of all users on the platform. Backend excludes
 * the caller's own user row (to avoid self-delete footguns) and returns
 * everyone else regardless of their roles.
 */
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await apiFetch<AdminUsersListResponse>("/user/admin/users");
  return res.users.map(toAdminUser);
}

export async function fetchAdminUser(userId: string): Promise<AdminUser> {
  const res = await apiFetch<AdminUserResponse>(`/user/admin/users/${userId}`);
  return toAdminUser(res.user);
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await apiFetch(`/user/admin/users/${userId}`, { method: "DELETE" });
}
