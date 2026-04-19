/** Shapes returned by medlink-api (snake_case JSON). */

export interface OrganizationDto {
  id: string;
  name: string;
  avatar_path: string;
  address?: string;
  phone_number?: string;
  working_hours?: string;
  rating?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GetManyOrganizationsResponse {
  organizations: OrganizationDto[];
}

export interface DepartmentDto {
  id: string;
  organization_id: string;
  name: string;
  organization_name?: string;
  code?: string;
  is_enabled?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GetManyDepartmentsResponse {
  departments: DepartmentDto[];
}

/** Matches `DoctorDepartmentInfoForUser` from medlink-api (`internal/user/repository/docdepts`). */
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

export interface ChatDto {
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
  chats: ChatDto[];
}

export interface CreateChatBody {
  doctor_department_id: string;
}

export interface CreateChatResponse {
  chat_id: string;
}

export interface ChatMessageAttachmentDto {
  id: string;
  message_id: string;
  file_path: string;
}

export interface ChatMessageDto {
  id: string;
  chat_id: string;
  sender_user_id: string;
  text_content: string;
  attachments: ChatMessageAttachmentDto[];
  created_at: string;
  updated_at: string;
}

export interface GetManyChatMessagesResponse {
  messages: ChatMessageDto[];
}

export interface SendChatMessageBody {
  text_content: string;
  attachment_urls?: string[];
}

export interface SendChatMessageResponse {
  message: ChatMessageDto;
}
