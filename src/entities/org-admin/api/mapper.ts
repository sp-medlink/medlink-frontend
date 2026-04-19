import type { OrgAdmin } from "../model/types";
import type { OrgAdminDto } from "./dto";

export function toOrgAdmin(api: OrgAdminDto): OrgAdmin {
  return {
    organizationId: api.organization_id,
    userId: api.admin_user_id,
    avatarPath: api.admin_avatar_path,
    firstName: api.admin_first_name,
    lastName: api.admin_last_name,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}
