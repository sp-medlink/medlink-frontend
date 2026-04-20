"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  markAllNotificationsRead,
  markNotificationRead,
  notificationKeys,
} from "@/entities/notification";

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: notificationKeys.all() });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["notifications", "mark-read"],
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => invalidate(qc),
  });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["notifications", "mark-all-read"],
    mutationFn: markAllNotificationsRead,
    onSuccess: () => invalidate(qc),
  });
}
