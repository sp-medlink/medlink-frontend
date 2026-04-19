export type { Department } from "./model/types";
export type {
  DepartmentDto,
  DepartmentMutateBody,
  DepartmentStatusBody,
} from "./api/dto";
export { departmentKeys } from "./api/keys";
export {
  fetchDepartmentsByOrg,
  fetchDepartmentByOrg,
  createDepartment,
  updateDepartmentByOrg,
  deleteDepartment,
  setDepartmentActiveByOrg,
  fetchDepartmentAsDeptAdmin,
  updateDepartmentAsDeptAdmin,
  setDepartmentActiveAsDeptAdmin,
} from "./api/departments.api";
export {
  departmentsByOrgQuery,
  departmentByOrgQuery,
  departmentAsDeptAdminQuery,
} from "./api/queries";
