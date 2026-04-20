"use client";

import { Reorder } from "framer-motion";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Settings } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAdminCapabilities, useAppRole, useCurrentUser } from "@/entities/session";
import { LogoutButton } from "@/features/auth-logout";
import { NotificationsBell } from "@/features/notifications-bell";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

import {
  getNavItems,
  isNavActive,
  type SidebarArea,
} from "../model/nav-config";

interface AppSidebarProps {
  area: SidebarArea;
  /** When false, sidebar is visually collapsed to a narrow rail. */
  expanded: boolean;
}

function normalizeOrder(order: string[], itemIds: string[]): string[] {
  const known = new Set(itemIds);
  const filtered = order.filter((id) => known.has(id));
  const missing = itemIds.filter((id) => !filtered.includes(id));
  return [...filtered, ...missing];
}

export function AppSidebar({ area, expanded }: AppSidebarProps) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const caps = useAdminCapabilities();
  const appRole = useAppRole();
  // Admin shortcut in patient/doctor sidebars + capability-gated items in the
  // admin sidebar are all driven by the same capability bag. `appRole` drives
  // the reverse shortcut (admin -> doctor/patient home).
  const items = getNavItems(area, { caps, appRole });
  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.href, item])),
    [items],
  );
  const rawItemIds = items.map((item) => item.href);
  const itemIdsKey = rawItemIds.join("|");
  const itemIds = useMemo(() => rawItemIds, [itemIdsKey]);
  const storageKey = `medlink:sidebar-order:${area}`;
  const [orderedIds, setOrderedIds] = useState<string[]>(itemIds);
  const dragStartedAtRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let nextOrder = itemIds;
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const parsedStrings = parsed.filter(
            (item): item is string => typeof item === "string",
          );
          nextOrder = normalizeOrder(parsedStrings, itemIds);
        }
      } catch {
        nextOrder = itemIds;
      }
    }
    setOrderedIds(nextOrder);
  }, [itemIdsKey, itemIds, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const normalized = normalizeOrder(orderedIds, itemIds);
    window.localStorage.setItem(storageKey, JSON.stringify(normalized));
  }, [itemIdsKey, itemIds, orderedIds, storageKey]);

  const orderedItems = useMemo(
    () =>
      normalizeOrder(orderedIds, itemIds)
        .map((id) => itemMap.get(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [itemIds, itemMap, orderedIds],
  );

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "Account";

  if (!expanded) {
    return (
      <aside
        id="app-sidebar"
        className="flex h-full min-h-0 w-full flex-col bg-transparent"
      >
        <div className="flex h-14 shrink-0 items-center justify-center border-b border-neutral-200">
          <Activity className="size-6 shrink-0 text-emerald-600" aria-hidden />
        </div>

        <nav
          className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto overflow-x-hidden px-1 py-3"
          aria-label="Main"
        >
          <Reorder.Group
            axis="y"
            values={orderedItems.map((item) => item.href)}
            onReorder={setOrderedIds}
            className="flex w-full flex-col gap-1"
          >
            {orderedItems.map(({ href, label, icon: Icon, match }) => {
            const active = isNavActive(pathname, href, match);
            return (
              <Reorder.Item
                key={href}
                value={href}
                whileDrag={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="w-full cursor-grab select-none active:cursor-grabbing"
                onDragStart={() => {
                  dragStartedAtRef.current = Date.now();
                }}
              >
                <Link
                  href={href as Route}
                  title={label}
                  onClick={(e) => {
                    if (Date.now() - dragStartedAtRef.current < 180) {
                      e.preventDefault();
                    }
                  }}
                  className={cn(
                    "flex w-full justify-center rounded-md px-2 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-neutral-200/80 font-medium text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-100",
                  )}
                  aria-label={label}
                >
                  <Icon className="size-5 shrink-0 opacity-85" aria-hidden />
                  <span className="sr-only">{label}</span>
                </Link>
              </Reorder.Item>
            );
            })}
          </Reorder.Group>
        </nav>

        <div className="flex shrink-0 flex-col items-center gap-2 border-t border-neutral-200 px-1 py-3">
          <NotificationsBell iconOnly />
          <Link
            href={routes.settings}
            className="flex size-10 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
            title="Profile & settings"
            aria-label="Profile & settings"
          >
            <Settings className="size-6 shrink-0 opacity-90" aria-hidden />
          </Link>
          <LogoutButton variant="outline" iconOnly className="shrink-0" />
        </div>
      </aside>
    );
  }

  return (
    <aside
      id="app-sidebar"
      className="flex h-full min-h-0 w-full flex-col bg-transparent"
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 px-3 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-2">
          <Activity className="size-7 shrink-0 text-emerald-600" aria-hidden />
          <span className="truncate bg-linear-to-r from-emerald-700 to-teal-600 bg-clip-text font-semibold tracking-tight text-transparent">
            Medlink
          </span>
        </div>
      </div>

      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden",
          expanded ? "p-3" : "px-1.5 py-3",
        )}
        aria-label="Main"
      >
        <Reorder.Group
          axis="y"
          values={orderedItems.map((item) => item.href)}
          onReorder={setOrderedIds}
          className="flex flex-col gap-1"
        >
          {orderedItems.map(({ href, label, icon: Icon, match }) => {
          const active = isNavActive(pathname, href, match);
          return (
            <Reorder.Item
              key={href}
              value={href}
              whileDrag={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="cursor-grab select-none active:cursor-grabbing"
              onDragStart={() => {
                dragStartedAtRef.current = Date.now();
              }}
            >
              <Link
                href={href as Route}
                title={expanded ? undefined : label}
                onClick={(e) => {
                  if (Date.now() - dragStartedAtRef.current < 180) {
                    e.preventDefault();
                  }
                }}
                className={cn(
                  "flex items-center rounded-md text-sm transition-colors",
                  expanded ? "gap-3 px-3 py-2" : "justify-center px-2 py-2.5",
                  active
                    ? "bg-neutral-200/80 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900",
                )}
              >
                <Icon className="size-5 shrink-0 opacity-80" aria-hidden />
                {expanded ? (
                  <span className="truncate">{label}</span>
                ) : (
                  <span className="sr-only">{label}</span>
                )}
              </Link>
            </Reorder.Item>
          );
          })}
        </Reorder.Group>
      </nav>

      <div
        className="border-t border-neutral-200 p-3"
      >
        <div className="mb-2">
          <NotificationsBell />
        </div>
        <Link
          href={routes.settings}
          className="mb-1 block truncate rounded-md px-1 py-0.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 hover:underline"
          title="Profile & settings"
        >
          {displayName}
        </Link>
        {user?.email ? (
          <p className="text-muted-foreground mb-2 truncate px-1 text-xs" title={user.email}>
            {user.email}
          </p>
        ) : (
          <p className="text-muted-foreground mb-2 truncate px-1 text-xs">—</p>
        )}
        <LogoutButton variant="outline" className="w-full justify-center" />
      </div>
    </aside>
  );
}
