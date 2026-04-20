export type {
  DoctorVerification,
  MyVerification,
  SubmitMyVerificationInput,
  VerificationStatus,
} from "./model/types";
export { doctorVerificationKeys } from "./api/keys";
export {
  fetchDoctorVerifications,
  fetchDoctorVerification,
  approveDoctorVerification,
  rejectDoctorVerification,
  revokeDoctorVerification,
  fetchMyVerification,
  submitMyVerification,
  deleteMyDoctorProfile,
} from "./api/verifications.api";
export {
  doctorVerificationsListQuery,
  doctorVerificationDetailQuery,
  myDoctorVerificationQuery,
} from "./api/queries";
