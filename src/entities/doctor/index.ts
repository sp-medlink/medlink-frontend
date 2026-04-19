export type { Doctor, DoctorDepartment, VerificationStatus } from "./model/types";
export { doctorDepartmentKeys } from "./api/doctor-department.keys";
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
} from "./api/doctor-department.queries";
