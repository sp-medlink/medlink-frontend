import type { AppointmentStatus } from "@/entities/appointment";

/**
 * Mirror of the backend's `validDoctorTransitions` table in
 * `internal/doctor/me/apptmgmt/service.go`. Keep in sync — the
 * backend is authoritative, but reproducing the table here lets the
 * UI hide illegal affordances instead of round-tripping just to
 * discover a transition isn't allowed.
 */
const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ["confirmed", "cancelled", "no_show"],
  confirmed: ["completed", "cancelled", "no_show"],
  // `in_progress` is no longer a target the doctor can pick, but legacy
  // rows already sitting there must still reach a terminal state.
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function allowedTransitions(
  from: AppointmentStatus,
): AppointmentStatus[] {
  return VALID_TRANSITIONS[from] ?? [];
}

export function canTransition(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  return allowedTransitions(from).includes(to);
}
