import type { Appointment } from "../model/types";

/**
 * Backend stores appointment date/time as naive strings
 * (`YYYY-MM-DD` + `HH:MM:SS`). We treat them as the source of truth:
 * display as-is, send as-is, compare via naive parsing. No TZ math.
 *
 * Function names kept UTC-flavored so call sites don't have to
 * re-import — internally, nothing UTC is happening.
 */

/** Parse backend `date` + `time` into a `Date` using naive local wall-clock. */
export function combineUtcDateAndTime(
  dateIso: string,
  time: string,
): Date | null {
  const d = dateIso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const t = time.match(/T(\d{2}):(\d{2})(?::(\d{2}))?|^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!d || !t) return null;
  const hh = Number(t[1] ?? t[4]);
  const mm = Number(t[2] ?? t[5]);
  const ss = Number(t[3] ?? t[6] ?? 0);
  return new Date(
    Number(d[1]),
    Number(d[2]) - 1,
    Number(d[3]),
    hh,
    mm,
    ss,
  );
}

export function apptAsLocalDate(appt: Appointment): Date | null {
  return combineUtcDateAndTime(appt.date, appt.time);
}

/** Raw `HH:MM` from the backend string, no conversion. */
export function formatApptLocalTime(_dateIso: string, time: string): string {
  const m = time.match(/T(\d{2}):(\d{2})|^(\d{2}):(\d{2})/);
  if (!m) return time;
  return `${m[1] ?? m[3]}:${m[2] ?? m[4]}`;
}

/** `Apr 20, 2026` style — no TZ conversion, parses date digits as-is. */
export function formatApptLocalDate(dateIso: string, _time: string): string {
  const m = dateIso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateIso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/** `true` iff the appt moment is strictly before now. */
export function isApptInPast(appt: Appointment): boolean {
  const dt = apptAsLocalDate(appt);
  return dt !== null && dt.getTime() < Date.now();
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isApptToday(appt: Appointment, nowMs = Date.now()): boolean {
  const dt = apptAsLocalDate(appt);
  return dt !== null && sameDay(dt, new Date(nowMs));
}
