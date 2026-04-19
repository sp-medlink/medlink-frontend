export interface OrganizationDto {
  id: string;
  avatar_path: string;
  name: string;
  uin: string;
  address: string;
  phone_number: string;
  launch_date: string;
  working_hours: string;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationsListResponse {
  organizations: OrganizationDto[];
}

export interface OrganizationResponse {
  organization: OrganizationDto;
}

export interface CreateOrganizationResponse {
  organization_id: string;
}

export interface OrganizationMutateBody {
  avatar_path: string;
  name: string;
  uin: string;
  address: string;
  phone_number: string;
  /** Backend accepts ISO date string (YYYY-MM-DD) here. */
  launch_date: string;
  working_hours: string;
}

/**
 * Platform-admin-scope create body. `initial_admin_user_id` is the
 * user who becomes the org's first admin (auto-elevated to the `admin`
 * base role server-side if they don't already hold it). The caller —
 * the Medlink operator — does NOT become an admin of the org.
 */
export interface PlatformCreateOrganizationBody extends OrganizationMutateBody {
  initial_admin_user_id: string;
}

export interface OrganizationStatusBody {
  is_active: boolean;
}
