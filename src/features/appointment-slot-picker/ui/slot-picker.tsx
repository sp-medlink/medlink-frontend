"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";

import {
  availableSlotsQuery,
  type AvailableSlotsDay,
} from "@/entities/appointment";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface SlotPickerProps {
  orgId: string;
  deptId: string;
  doctorDepartmentId: string;
  /** Called when the user taps a time. */
  onSelect: (args: { date: string; time: string }) => void;
  /** Controlled highlight — format `YYYY-MM-DD HH:MM:SS`. */
  selected?: { date: string; time: string } | null;
  /** Days to fetch ahead; default 14. Backend caps at 31. */
  windowDays?: number;
  className?: string;
}

/**
 * Minimal rolling slot picker — days-strip on top, times grid below.
 * Intentionally not a full month calendar: a 14-day strip covers the
 * "book in the next couple of weeks" use case at a fraction of the
 * implementation cost, and scrolling with ◀ / ▶ gives 90% of the UX.
 *
 * The rolling anchor is held in state: ◀ rewinds by `windowDays`, ▶
 * advances. Each anchor shift refetches the window through React
 * Query — the hook inside `availableSlotsQuery` caches per range so
 * paging back-and-forth is free.
 */
export function SlotPicker({
  orgId,
  deptId,
  doctorDepartmentId,
  onSelect,
  selected,
  windowDays = 14,
  className,
}: SlotPickerProps) {
  const [anchor, setAnchor] = useState(() => todayIso());
  const { dateFrom, dateTo } = useMemo(
    () => deriveRange(anchor, windowDays),
    [anchor, windowDays],
  );

  const query = useQuery(
    availableSlotsQuery({
      orgId,
      deptId,
      doctorDepartmentId,
      dateFrom,
      dateTo,
    }),
  );

  const byDate = useMemo(() => indexByDate(query.data ?? []), [query.data]);
  const days = useMemo(
    () => enumerateDays(dateFrom, windowDays),
    [dateFrom, windowDays],
  );

  const [activeDate, setActiveDate] = useState<string | null>(null);
  const resolvedActiveDate = resolveActiveDate(activeDate, selected, days, byDate);
  const rawActiveTimes = resolvedActiveDate
    ? byDate.get(resolvedActiveDate) ?? []
    : [];
  // Backend returns slot times as UTC (`HH:MM:SS`). Strip anything whose
  // wall-clock moment is already in the past so the user can't pick a
  // slot the backend will reject.
  const nowMs = Date.now();
  const activeTimes = resolvedActiveDate
    ? rawActiveTimes.filter((t) => {
        const dt = combineUtc(resolvedActiveDate, t);
        return dt !== null && dt.getTime() > nowMs;
      })
    : [];

  const isAtToday = anchor === todayIso();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {formatRange(dateFrom, dateTo)}
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={isAtToday || query.isPending}
            onClick={() => setAnchor(shiftIso(anchor, -windowDays))}
            aria-label="Previous window"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={query.isPending}
            onClick={() => setAnchor(shiftIso(anchor, windowDays))}
            aria-label="Next window"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 h-22">
        {query.isLoading && <div className="h-full animate-spin"></div>}
        {days.map((d) => {
          const available = (byDate.get(d.iso) ?? []).length;
          const isActive = d.iso === resolvedActiveDate;
          const disabled = available === 0;
          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => setActiveDate(d.iso)}
              disabled={disabled}
              className={cn(
                "flex min-w-[68px] flex-col items-center gap-0.5 rounded-xl border px-3 py-2 text-center transition",
                isActive
                  ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                  : "border-border bg-background hover:border-neutral-400 dark:hover:border-neutral-600",
                disabled
                  ? "cursor-not-allowed opacity-40 hover:border-border dark:hover:border-border"
                  : "cursor-pointer",
              )}
            >
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {d.weekday}
              </span>
              <span className="text-base font-semibold">{d.day}</span>
              <span className="text-[10px] text-muted-foreground">
                {available} free
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[3rem]">
        {query.isPending ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading slots…
          </div>
        ) : query.isError ? (
          <p className="py-4 text-sm text-destructive">
            Couldn&apos;t load availability.
          </p>
        ) : !resolvedActiveDate ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No days with free slots in this window — try another range.
          </p>
        ) : activeTimes.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nothing free on this day.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeTimes.map((t) => {
              const isSelected =
                selected?.date === resolvedActiveDate &&
                selected?.time === t;
              // Backend time is the source of truth — display raw `HH:MM`.
              const label = t.slice(0, 5);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    onSelect({ date: resolvedActiveDate, time: t })
                  }
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border bg-background hover:border-neutral-400 hover:bg-neutral-50 dark:hover:border-neutral-600 dark:hover:bg-neutral-900",
                  )}
                >
                  <Clock className="size-3.5 opacity-70" aria-hidden />
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- local helpers (pure, no state) -------------------------- */

/**
 * Parse backend `YYYY-MM-DD` + `HH:MM[:SS]` as naive wall-clock — no
 * TZ conversion. Used only to compare against `Date.now()` for the
 * past-slot filter.
 */
function combineUtc(dateIso: string, time: string): Date | null {
  const d = dateIso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const t = time.match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!d || !t) return null;
  return new Date(
    Number(d[1]),
    Number(d[2]) - 1,
    Number(d[3]),
    Number(t[1]),
    Number(t[2]),
    Number(t[3] ?? 0),
  );
}

function todayIso(): string {
  const d = new Date();
  return toIso(d);
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shiftIso(iso: string, deltaDays: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return toIso(d);
}

function deriveRange(anchor: string, windowDays: number) {
  return { dateFrom: anchor, dateTo: shiftIso(anchor, windowDays - 1) };
}

function indexByDate(days: AvailableSlotsDay[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const day of days) {
    map.set(day.date, day.times);
  }
  return map;
}

interface DayCell {
  iso: string;
  weekday: string;
  day: string;
}

function enumerateDays(fromIso: string, count: number): DayCell[] {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const out: DayCell[] = [];
  for (let i = 0; i < count; i += 1) {
    const iso = shiftIso(fromIso, i);
    const d = new Date(`${iso}T00:00:00`);
    out.push({
      iso,
      weekday: weekdays[d.getDay()] ?? "",
      day: String(d.getDate()),
    });
  }
  return out;
}

function formatRange(from: string, to: string): string {
  const f = new Date(`${from}T00:00:00`);
  const t = new Date(`${to}T00:00:00`);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(f)} – ${fmt(t)}`;
}

/**
 * Picks which date the time grid should show. Priority:
 *   1. explicit user tap (activeDate)
 *   2. currently-selected slot (so a preselection survives re-open)
 *   3. first day in the window that actually has free slots
 */
function resolveActiveDate(
  activeDate: string | null,
  selected: { date: string; time: string } | null | undefined,
  days: DayCell[],
  byDate: Map<string, string[]>,
): string | null {
  if (activeDate && byDate.get(activeDate)?.length) return activeDate;
  if (
    selected &&
    days.some((d) => d.iso === selected.date) &&
    byDate.get(selected.date)?.length
  ) {
    return selected.date;
  }
  for (const d of days) {
    if ((byDate.get(d.iso) ?? []).length > 0) return d.iso;
  }
  return null;
}
