export type { Doctor, DoctorDepartment, VerificationStatus } from "./model/types";
export { doctorDepartmentKeys } from "./api/doctor-department.keys";
export {
  fetchMyDoctorProfile,
} from "./api/doctor.api";
export { myDoctorProfileOptions } from "./api/doctor.queries";
export {
  fetchDoctorDepartmentsByOrgDept,
  setDoctorDeptAdmin,
  fetchDoctorDepartmentsAsDeptAdmin,
  setDoctorDeptActive,
  removeDoctorFromDepartment,
  fetchMyDoctorDepartments,
} from "./api/doctor-department.api";
export {
  doctorDepartmentsByOrgDeptQuery,
  doctorDepartmentsAsDeptAdminQuery,
  myDoctorDepartmentsQuery,
  myDoctorDepartmentsQuery as myDoctorDepartmentsOptions,
} from "./api/doctor-department.queries";
