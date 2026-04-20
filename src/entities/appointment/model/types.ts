export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

/**
 * Terminal states — an appointment in one of these can't be further
 * mutated (rescheduled, cancelled, transitioned). Mirrors the
 * backend-side `isTerminal` helper.
 */
export const APPOINTMENT_TERMINAL_STATUSES: ReadonlyArray<AppointmentStatus> = [
  "completed",
  "cancelled",
  "no_show",
];

export function isTerminalStatus(status: AppointmentStatus): boolean {
  return APPOINTMENT_TERMINAL_STATUSES.includes(status);
}

export interface Appointment {
  id: string;
  /** Patient user id. On the doctor-side response this is the patient;
   *  on the patient-side response it is the patient themselves. */
  userId: string;
  /** Doctor-side responses include patient identity. Absent on patient-side. */
  patientFirstName: string;
  patientLastName: string;
  patientAvatarPath: string;
  doctorDepartmentId: string;
  doctorAvatarPath: string;
  doctorFirstName: string;
  doctorLastName: string;
  departmentId: string;
  departmentName: string;
  organizationId: string;
  organizationName: string;
  date: string;
  time: string;
  isOnline: boolean;
  isEnabled: boolean;
  isOnSchedule: boolean;
  /** Slot duration in minutes, from the doctor-department row. Drives
   *  the VC availability window on the client. */
  apptDurationInMinutes: number;
  /** Lifecycle state (backend migration 000004). */
  status: AppointmentStatus;
  /** Populated only when `status === "cancelled"`. */
  cancellationReason: string;
  /** Actor user id who cancelled the appointment; null otherwise. */
  cancelledBy: string | null;
  createdAt: string;
  updatedAt: string;
}
