export type { Doctor, DoctorDepartment, VerificationStatus } from "./model/types";
export { doctorDepartmentKeys } from "./api/doctor-department.keys";
export { doctorProfileKeys } from "./api/doctor.keys";
export {
  fetchMyDoctorProfile,
  submitMyDoctorProfile,
  type SubmitDoctorProfileBody,
} from "./api/doctor.api";
export { myDoctorProfileOptions } from "./api/doctor.queries";
export {
  fetchDoctorDepartmentsByOrgDept,
  setDoctorDeptAdmin,
  fetchDoctorDepartmentsAsDeptAdmin,
  setDoctorDeptActive,
  removeDoctorFromDepartment,
  fetchMyDoctorDepartments,
  setDoctorDepartmentActive,
  deleteDoctorDepartment,
  updateMyDoctorDepartment,
  type UpdateMyDoctorDepartmentBody,
} from "./api/doctor-department.api";
export {
  doctorDepartmentsByOrgDeptQuery,
  doctorDepartmentsAsDeptAdminQuery,
  myDoctorDepartmentsQuery,
  // Alias exported from queries.ts for callers preferring the
  // `*Options` naming used elsewhere.
  myDoctorDepartmentsOptions,
} from "./api/doctor-department.queries";
