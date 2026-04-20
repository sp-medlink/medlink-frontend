import type { Appointment } from "../model/types";
import { apptAsLocalDate } from "./time";

/**
 * Matches the backend's `vcGracePeriod` in
 * `internal/doctor/me/apptmgmt/service.go` and its twin on the patient
 * side. Keep in sync — the token endpoint returns 403 outside this
 * window, so the client must enforce the same limits to give accurate
 * "too early / too late" feedback.
 */
export const VC_GRACE_MINUTES = 10;

export type VcWindowPhase =
  | "unknown" // Can't parse date/time — treat as disabled
  | "too_early" // Before start - grace
  | "open" // Within the join window
  | "expired"; // After end + grace

export interface VcWindowInfo {
  phase: VcWindowPhase;
  /** ms until the window opens; negative when already open. */
  msUntilOpen: number;
  /** ms until the window closes; negative when already expired. */
  msUntilClose: number;
  /** Absolute timestamps, millis. */
  startMs: number;
  openMs: number;
  closeMs: number;
}

function parseStart(appt: Appointment): number | null {
  // Backend stores appt date/time in UTC; go through the shared
  // UTC→local combiner so the VC window lines up with wall-clock now.
  const dt = apptAsLocalDate(appt);
  return dt === null ? null : dt.getTime();
}

export function computeVcWindow(
  appt: Appointment,
  nowMs = Date.now(),
): VcWindowInfo {
  const startMs = parseStart(appt);
  if (startMs === null) {
    return {
      phase: "unknown",
      msUntilOpen: 0,
      msUntilClose: 0,
      startMs: 0,
      openMs: 0,
      closeMs: 0,
    };
  }
  const graceMs = VC_GRACE_MINUTES * 60_000;
  const durationMs = appt.apptDurationInMinutes * 60_000;
  const openMs = startMs - graceMs;
  const closeMs = startMs + durationMs + graceMs;

  let phase: VcWindowPhase;
  if (nowMs < openMs) phase = "too_early";
  else if (nowMs > closeMs) phase = "expired";
  else phase = "open";

  return {
    phase,
    msUntilOpen: openMs - nowMs,
    msUntilClose: closeMs - nowMs,
    startMs,
    openMs,
    closeMs,
  };
}

/**
 * Short human label for the window state — shown next to / under the
 * Join button. Format is intentionally terse: "Opens in 23m", "Ends
 * in 12m", "Available now".
 */
export function formatVcWindowHint(info: VcWindowInfo): string {
  if (info.phase === "unknown") return "";
  if (info.phase === "open") {
    if (info.msUntilClose < 60_000) return "Window closing";
    const mins = Math.max(1, Math.round(info.msUntilClose / 60_000));
    if (mins <= 60) return `Ends in ${mins}m`;
    return "Available now";
  }
  if (info.phase === "too_early") {
    const mins = Math.round(info.msUntilOpen / 60_000);
    if (mins < 60) return `Opens in ${mins}m`;
    if (mins < 24 * 60) return `Opens in ${Math.round(mins / 60)}h`;
    return `Opens in ${Math.round(mins / (24 * 60))}d`;
  }
  return "Window closed";
}
