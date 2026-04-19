"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ChevronLeft, Settings } from "lucide-react";

import { useCurrentUser } from "@/entities/session";
import { LogoutButton } from "@/features/auth-logout";
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

import {
  getNavItems,
  isNavActive,
  type SidebarArea,
} from "../model/nav-config";

interface AppSidebarProps {
  area: SidebarArea;
  /** When false, sidebar is narrow and only icons are visible (labels stay in DOM for a11y). */
  expanded: boolean;
  onToggle: () => void;
}

export function AppSidebar({ area, expanded, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const items = getNavItems(area);

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "Account";

  return (
    <aside
      id="app-sidebar"
      className="flex h-full min-h-screen w-full flex-col bg-transparent"
    >
      {expanded ? (
        <div className="flex h-14 shrink-0 items-center justify-between gap-1 border-b border-neutral-200 px-2 dark:border-neutral-800">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Activity className="size-6 shrink-0 text-emerald-600" aria-hidden />
            <span className="truncate bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text font-semibold tracking-tight text-transparent dark:from-emerald-400 dark:to-teal-400">
              Medlink
            </span>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded
            aria-controls="app-sidebar"
            aria-label="Collapse sidebar"
            title="Show icons only"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-emerald-700/30 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/30 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 active:scale-[0.96] dark:border-emerald-400/40 dark:bg-emerald-500 dark:ring-emerald-300/25 dark:hover:bg-emerald-400"
          >
            <ChevronLeft className="size-5" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 flex-col items-center gap-2 border-b border-neutral-200 px-1 py-3 dark:border-neutral-800">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={false}
            aria-controls="app-sidebar"
            aria-label="Expand sidebar"
            title="Show labels"
            className="flex size-8 min-w-8 shrink-0 items-center justify-center rounded-xl border-2 border-emerald-700/30 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/30 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 active:scale-[0.96] dark:border-emerald-400/40 dark:bg-emerald-500 dark:ring-emerald-300/25 dark:hover:bg-emerald-400"
          >
            <span className="flex rotate-180 items-center justify-center transition-transform duration-200">
              <ChevronLeft className="size-4" strokeWidth={2.5} aria-hidden />
            </span>
          </button>
          <div className="flex flex-col items-center gap-1.5">
            <Activity className="size-6 shrink-0 text-emerald-600" aria-hidden />
            <span className="max-w-[3.25rem] bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-center text-[0.65rem] font-semibold leading-tight text-transparent dark:from-emerald-400 dark:to-teal-400">
              Medlink
            </span>
          </div>
        </div>
      )}

      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden",
          expanded ? "p-3" : "px-1.5 py-3",
        )}
        aria-label="Main"
      >
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = isNavActive(pathname, href, match);
          return (
            <Link
              key={label}
              href={href as Route}
              title={expanded ? undefined : label}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors",
                expanded ? "gap-3 px-3 py-2" : "justify-center px-2 py-2.5",
                active
                  ? "bg-neutral-200/80 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
              {expanded ? (
                <span className="truncate">{label}</span>
              ) : (
                <span className="sr-only">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "border-t border-neutral-200 dark:border-neutral-800",
          expanded ? "p-3" : "flex flex-col items-center gap-2 px-1.5 py-3",
        )}
      >
        {expanded ? (
          <>
            <Link
              href={routes.settings}
              className="mb-1 block truncate rounded-md px-1 py-0.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 hover:underline dark:text-neutral-100 dark:hover:bg-neutral-900"
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
          </>
        ) : (
          <>
            <Link
              href={routes.settings}
              className="flex size-10 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
              title="Profile & settings"
              aria-label="Profile & settings"
            >
              <Settings className="size-5 shrink-0 opacity-90" aria-hidden />
            </Link>
            <LogoutButton variant="outline" iconOnly className="shrink-0" />
          </>
        )}
      </div>
    </aside>
  );
}
