export interface PlatformAdminDto {
  user_id: string;
  avatar_path: string;
  first_name: string;
  last_name: string;
  role_id: number;
  created_at: string;
  updated_at: string;
}

export interface PlatformAdminsListResponse {
  admins: PlatformAdminDto[];
}

export interface AddPlatformAdminBody {
  user_id: string;
}
