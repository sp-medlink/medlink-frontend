export interface OrgAdminDto {
  organization_id: string;
  admin_user_id: string;
  admin_avatar_path: string;
  admin_first_name: string;
  admin_last_name: string;
  created_at: string;
  updated_at: string;
}

export interface OrgAdminsListResponse {
  admins: OrgAdminDto[];
}

export interface AddOrgAdminBody {
  user_id: string;
}
