export type { DoctorDirectoryResult, DoctorDepartmentDto } from "./api/directory.api";
export {
  fetchSiteWideDoctorDirectory,
  fetchOrganizations,
  fetchOrganization,
  fetchDepartments,
  fetchDepartment,
  fetchDoctorDepartments,
  resolveChatIdForDoctorDepartment,
  fetchMyChats,
  createChat,
} from "./api/directory.api";
