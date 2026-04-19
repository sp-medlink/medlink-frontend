export type {
  DoctorVerification,
  VerificationStatus,
} from "./model/types";
export { doctorVerificationKeys } from "./api/keys";
export {
  fetchDoctorVerifications,
  fetchDoctorVerification,
  approveDoctorVerification,
  rejectDoctorVerification,
  revokeDoctorVerification,
} from "./api/verifications.api";
export {
  doctorVerificationsListQuery,
  doctorVerificationDetailQuery,
} from "./api/queries";
