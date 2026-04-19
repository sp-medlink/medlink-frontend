"use client";

import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface AdminEntryCardProps {
  href: Route;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Optional trailing hint (e.g. "Platform admin only"). */
  hint?: string;
}

/**
 * Clickable card used on the admin overview grid. Pure presentational —
 * caller decides whether it's visible based on capabilities.
 */
export function AdminEntryCard({
  href,
  icon: Icon,
  title,
  description,
  hint,
}: AdminEntryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border p-5 transition-colors",
        "border-neutral-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40",
        "dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            "bg-emerald-50 text-emerald-700",
            "dark:bg-emerald-950 dark:text-emerald-300",
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </div>
        <ArrowUpRight
          className="size-4 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {hint ? (
        <p className="text-muted-foreground mt-auto text-[11px] uppercase tracking-wider">
          {hint}
        </p>
      ) : null}
    </Link>
  );
}
