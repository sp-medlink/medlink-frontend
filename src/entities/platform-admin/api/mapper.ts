import type { PlatformAdmin } from "../model/types";
import type { PlatformAdminDto } from "./dto";

export function toPlatformAdmin(api: PlatformAdminDto): PlatformAdmin {
  return {
    userId: api.user_id,
    avatarPath: api.avatar_path,
    firstName: api.first_name,
    lastName: api.last_name,
    roleId: api.role_id,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}
