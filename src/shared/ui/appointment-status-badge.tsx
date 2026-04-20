"use client";

import {
  Ban,
  CalendarCheck2,
  CheckCheck,
  Clock3,
  PlayCircle,
  UserMinus,
  type LucideIcon,
} from "lucide-react";

import type { AppointmentStatus } from "@/entities/appointment";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  /** Shown as a tooltip/title — typical use: cancellation reason. */
  detail?: string | null;
  className?: string;
}

interface Preset {
  label: string;
  icon: LucideIcon;
  /** Tailwind classes applied on top of the Badge's variant base. */
  className: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

/**
 * Centralised mapping so every surface shows the same colour+icon for
 * a given status. Cancelled exposes the reason via `detail` — hovering
 * surfaces it in a native tooltip without stealing screen space.
 */
const PRESETS: Record<AppointmentStatus, Preset> = {
  scheduled: {
    label: "Scheduled",
    icon: Clock3,
    variant: "outline",
    className: "text-neutral-700 dark:text-neutral-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: CalendarCheck2,
    variant: "default",
    className: "bg-emerald-600 text-white hover:bg-emerald-600/90",
  },
  in_progress: {
    label: "In progress",
    icon: PlayCircle,
    variant: "default",
    className: "bg-amber-500 text-white hover:bg-amber-500/90",
  },
  completed: {
    label: "Completed",
    icon: CheckCheck,
    variant: "secondary",
    className: "bg-blue-600 text-white hover:bg-blue-600/90",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    variant: "destructive",
    className: "",
  },
  no_show: {
    label: "No-show",
    icon: UserMinus,
    variant: "outline",
    className: "border-destructive text-destructive",
  },
};

export function AppointmentStatusBadge({
  status,
  detail,
  className,
}: AppointmentStatusBadgeProps) {
  const preset = PRESETS[status];
  const Icon = preset.icon;
  return (
    <Badge
      variant={preset.variant ?? "default"}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap",
        preset.className,
        className,
      )}
      title={detail || undefined}
    >
      <Icon className="size-3" aria-hidden />
      {preset.label}
    </Badge>
  );
}
