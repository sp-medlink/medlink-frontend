import { queryOptions } from "@tanstack/react-query";

import { apiFetch } from "@/shared/api";

import type { Notification } from "../model/types";
import type {
  ListNotificationsResponse,
  UnreadCountResponse,
} from "./dto";
import { toNotification } from "./mapper";

export const notificationKeys = {
  all: () => ["notifications"] as const,
  list: (opts: { limit?: number; unreadOnly?: boolean } = {}) =>
    [
      ...notificationKeys.all(),
      "list",
      opts.limit ?? 50,
      opts.unreadOnly ?? false,
    ] as const,
  unreadCount: () => [...notificationKeys.all(), "unread-count"] as const,
};

export async function fetchMyNotifications(opts: {
  limit?: number;
  unreadOnly?: boolean;
} = {}): Promise<Notification[]> {
  const res = await apiFetch<ListNotificationsResponse>(
    "/user/me/notifications",
    {
      query: {
        limit: opts.limit,
        unread_only: opts.unreadOnly ? "true" : undefined,
      },
    },
  );
  return (res.notifications ?? []).map(toNotification);
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const res = await apiFetch<UnreadCountResponse>(
    "/user/me/notifications/unread-count",
  );
  return res.unread ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch<unknown>(`/user/me/notifications/${id}/read`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch<unknown>("/user/me/notifications/read-all", {
    method: "POST",
  });
}

export function notificationsListQuery(opts: {
  limit?: number;
  unreadOnly?: boolean;
} = {}) {
  return queryOptions({
    queryKey: notificationKeys.list(opts),
    queryFn: () => fetchMyNotifications(opts),
    // Stale but not too stale — bell UI refetches on focus anyway.
    staleTime: 20_000,
  });
}

export function unreadNotificationCountQuery() {
  return queryOptions({
    queryKey: notificationKeys.unreadCount(),
    queryFn: fetchUnreadNotificationCount,
    // Frequent polling would be nice; rely on invalidation from
    // mutations + focus refetch instead.
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}
