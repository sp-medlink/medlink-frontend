"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";

import {
  notificationsListQuery,
  unreadNotificationCountQuery,
  type Notification,
} from "@/entities/notification";
import { cn } from "@/shared/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";

import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "../api/mutations";

interface NotificationsBellProps {
  /** Compact icon-only rendering for a collapsed sidebar. */
  iconOnly?: boolean;
}

function relative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function NotificationsBell({ iconOnly = false }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const countQuery = useQuery(unreadNotificationCountQuery());
  const listQuery = useQuery({
    ...notificationsListQuery({ limit: 10 }),
    enabled: open,
  });
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();

  const unread = countQuery.data ?? 0;
  const rows = listQuery.data ?? [];

  const handleRowClick = (n: Notification) => {
    if (!n.readAt) markRead.mutate(n.id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            unread > 0 ? `Notifications (${unread} unread)` : "Notifications"
          }
          className={cn(
            "relative inline-flex items-center gap-2 rounded-md text-sm transition-colors",
            iconOnly
              ? "size-10 justify-center text-neutral-600 hover:bg-neutral-100"
              : "w-full px-3 py-2 text-neutral-600 hover:bg-neutral-100",
          )}
        >
          <span className="relative inline-flex">
            <Bell className="size-5 shrink-0" aria-hidden />
            {unread > 0 ? (
              <span
                className="absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white"
                aria-hidden
              >
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </span>
          {iconOnly ? (
            <span className="sr-only">Notifications</span>
          ) : (
            <span className="truncate">Notifications</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0" sideOffset={8}>
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-muted-foreground text-xs">
              {unread > 0
                ? `${unread} unread`
                : "You're all caught up"}
            </p>
          </div>
          {unread > 0 ? (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition disabled:opacity-60"
            >
              {markAll.isPending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <CheckCheck className="size-3.5" aria-hidden />
              )}
              Mark all read
            </button>
          ) : null}
        </header>

        <div className="max-h-96 overflow-y-auto">
          {listQuery.isPending ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading…
            </div>
          ) : listQuery.isError ? (
            <p className="px-4 py-6 text-sm text-destructive">
              Could not load notifications.
            </p>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Bell className="size-5 text-muted-foreground" aria-hidden />
              <p className="text-muted-foreground text-sm">
                No notifications yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {rows.map((n) => {
                const unreadRow = !n.readAt;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleRowClick(n)}
                      className={cn(
                        "flex w-full items-start gap-2 px-4 py-3 text-left transition hover:bg-muted/40",
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
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-sm",
                            unreadRow ? "font-semibold" : "font-medium",
                          )}
                        >
                          {n.title}
                        </span>
                        {n.body ? (
                          <span className="text-muted-foreground block text-xs">
                            {n.body}
                          </span>
                        ) : null}
                        <span className="text-muted-foreground mt-0.5 block text-[11px]">
                          {relative(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="border-t px-4 py-2">
          <Link
            href={"/notifications" as Route}
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium"
          >
            See all notifications
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </footer>
      </PopoverContent>
    </Popover>
  );
}
