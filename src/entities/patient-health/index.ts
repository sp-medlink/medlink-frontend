export type { PatientHealthProfile } from "./model/types";
export type { UpdateMyHealthBody } from "./api/dto";
export {
  fetchMyHealth,
  updateMyHealth,
  myHealthQuery,
  fetchPatientHealthForAppointment,
  patientHealthByApptQuery,
  patientHealthKeys,
} from "./api/patient-health.api";
