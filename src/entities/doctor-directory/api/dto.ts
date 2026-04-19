/** Public catalog DTOs (`snake_case`) — medlink-api. */

export interface OrganizationDto {
  id: string;
  name: string;
  avatar_path: string;
  is_active?: boolean;
}

export interface GetManyOrganizationsResponse {
  organizations: OrganizationDto[];
}

/** GET /organizations/{org_id} */
export interface GetOrganizationResponse {
  organization: OrganizationDto;
}

export interface DepartmentDto {
  id: string;
  organization_id: string;
  name: string;
  is_enabled?: boolean;
  is_active?: boolean;
}

export interface GetManyDepartmentsResponse {
  departments: DepartmentDto[];
}

/** GET /organizations/{org_id}/departments/{dept_id} */
export interface GetDepartmentResponse {
  department: DepartmentDto;
}

export interface DoctorDepartmentDto {
  doctor_department_id: string;
  doctor_id: string;
  avatar_path: string;
  first_name: string;
  last_name: string;
  education: string;
  experience: string;
  department_id: string;
  department_name: string;
  organization_id: string;
  organization_name: string;
  position: string;
  description: string;
  appt_duration_in_minutes: number;
  is_dept_admin: boolean;
  rating: number;
  is_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetManyDoctorDepartmentsResponse {
  doctor_departments: DoctorDepartmentDto[];
}

/** GET /organizations/{org_id}/departments/{dept_id}/doctors/{doc_dept_id} */
export interface GetDoctorDepartmentResponse {
  doctor_department: DoctorDepartmentDto;
}

/** Matches user chat list payload from medlink-api. */
export interface ChatListItemDto {
  id: string;
  user_id: string;
  doctor_department_id: string;
  doctor_user_id: string;
  doctor_avatar_path: string;
  doctor_first_name: string;
  doctor_last_name: string;
  last_message_created_at: string;
  created_at: string;
  updated_at: string;
}

export interface GetManyChatsResponse {
  chats: ChatListItemDto[];
}

export interface CreateChatBody {
  doctor_department_id: string;
}

export interface CreateChatResponse {
  chat_id: string;
}
