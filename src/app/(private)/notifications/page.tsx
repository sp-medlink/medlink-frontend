"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import {
  notificationsListQuery,
  type Notification,
} from "@/entities/notification";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notifications-bell";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

function relative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const q = useQuery(notificationsListQuery({ limit: 200, unreadOnly }));
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();
  const rows = q.data ?? [];

  const handleRowClick = (n: Notification) => {
    if (!n.readAt) markRead.mutate(n.id);
  };

  const hasUnread = rows.some((n) => !n.readAt);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Notifications
          </h1>
          <p className="text-muted-foreground text-sm">
            Everything that happened on your appointments and visits.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={unreadOnly ? "default" : "outline"}
            onClick={() => setUnreadOnly((v) => !v)}
          >
            {unreadOnly ? "Showing unread" : "Show unread only"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!hasUnread || markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            {markAll.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
            ) : (
              <CheckCheck className="mr-1.5 size-4" aria-hidden />
            )}
            Mark all read
          </Button>
        </div>
      </header>

      {q.isPending ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading…
        </div>
      ) : q.isError ? (
        <p className="text-destructive text-sm">
          Could not load notifications.
        </p>
      ) : rows.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <Bell className="mx-auto mb-1 size-6 text-muted-foreground" aria-hidden />
            <CardTitle className="text-base">
              {unreadOnly ? "No unread notifications" : "No notifications yet"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-center text-sm">
            Appointment activity will show up here.
          </CardContent>
        </Card>
      ) : (
        <ul className="divide-y rounded-2xl border bg-card shadow-sm">
          {rows.map((n) => {
            const unreadRow = !n.readAt;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleRowClick(n)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/40",
                    unreadRow && "bg-emerald-50/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      unreadRow ? "bg-emerald-500" : "bg-transparent",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm",
                        unreadRow ? "font-semibold" : "font-medium",
                      )}
                    >
                      {n.title}
                    </p>
                    {n.body ? (
                      <p className="text-muted-foreground text-sm">
                        {n.body}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      {relative(n.createdAt)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
