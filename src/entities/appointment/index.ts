export type {
  Appointment,
  AppointmentStatus,
} from "./model/types";
export {
  APPOINTMENT_TERMINAL_STATUSES,
  isTerminalStatus,
} from "./model/types";
export {
  fetchMyAppointment,
  fetchMyAppointments,
  createMyAppointment,
  cancelMyAppointment,
  fetchVideoCallTokenForAppointment,
  fetchDoctorAppointments,
  setDoctorAppointmentOnSchedule,
  setDoctorAppointmentLifecycle,
  fetchVideoCallTokenForDoctorAppointment,
} from "./api/appointment.api";
export { appointmentKeys } from "./api/appointment.keys";
export {
  appointmentsListOptions,
  appointmentDetailOptions,
} from "./api/appointment.queries";
export {
  fetchAvailableSlots,
  availableSlotsKeys,
  availableSlotsQuery,
} from "./api/available-slots.api";
export type { AvailableSlotsDay } from "./api/available-slots.api";
export { formatVCJoinError } from "./lib/vc-error";
export {
  combineUtcDateAndTime,
  apptAsLocalDate,
  formatApptLocalTime,
  formatApptLocalDate,
  isApptInPast,
  isApptToday,
} from "./lib/time";
export {
  computeVcWindow,
  formatVcWindowHint,
  VC_GRACE_MINUTES,
  type VcWindowInfo,
  type VcWindowPhase,
} from "./lib/vc-window";
