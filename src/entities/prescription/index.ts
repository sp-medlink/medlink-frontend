export type { Prescription } from "./model/types";
export type { CreatePrescriptionBody } from "./api/prescription.api";
export {
  fetchDoctorPrescriptions,
  createDoctorPrescription,
  deleteDoctorPrescription,
  fetchMyPrescriptionsByAppointment,
  fetchMyPrescriptions,
  doctorPrescriptionsQuery,
  myPrescriptionsByAppointmentQuery,
  myPrescriptionsFlatQuery,
  prescriptionKeys,
} from "./api/prescription.api";
