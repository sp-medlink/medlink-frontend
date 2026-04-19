export type { Appointment } from "./model/types";
export {
  fetchMyAppointment,
  fetchMyAppointments,
  createMyAppointment,
  fetchVideoCallTokenForAppointment,
  fetchDoctorAppointments,
  setDoctorAppointmentOnSchedule,
  fetchVideoCallTokenForDoctorAppointment,
} from "./api/appointment.api";
export { appointmentKeys } from "./api/appointment.keys";
export {
  appointmentsListOptions,
  appointmentDetailOptions,
} from "./api/appointment.queries";
