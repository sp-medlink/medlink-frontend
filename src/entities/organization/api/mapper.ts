import type { Organization } from "../model/types";
import type { OrganizationDto } from "./dto";

export function toOrganization(api: OrganizationDto): Organization {
  return {
    id: api.id,
    avatarPath: api.avatar_path,
    name: api.name,
    uin: api.uin,
    address: api.address,
    phoneNumber: api.phone_number,
    launchDate: api.launch_date,
    workingHours: api.working_hours,
    rating: api.rating,
    isActive: api.is_active,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}
