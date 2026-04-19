import type { AdminUser } from "../model/types";
import type { AdminUserDto } from "./dto";

export function toAdminUser(api: AdminUserDto): AdminUser {
  return {
    id: api.id,
    avatarPath: api.avatar_path,
    firstName: api.first_name,
    lastName: api.last_name,
    iin: api.iin,
    phoneNumber: api.phone_number,
    email: api.email,
    birthDate: api.birth_date,
    gender: api.gender,
    address: api.address,
    roles: api.roles ?? [],
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}
