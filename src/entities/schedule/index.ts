export type { ScheduleSlot } from "./model/types";
export { scheduleKeys } from "./api/schedule.keys";
export {
  fetchDoctorSchedule,
  fetchPublicDoctorSchedule,
  createDoctorScheduleSlot,
  updateDoctorScheduleSlot,
  deleteDoctorScheduleSlot,
  setDoctorScheduleActive,
} from "./api/schedule.api";
export {
  publicDoctorScheduleOptions,
  doctorScheduleOptions,
} from "./api/schedule.queries";
