import type { Department } from "../model/types";
import type { DepartmentDto } from "./dto";

export function toDepartment(api: DepartmentDto): Department {
  return {
    id: api.id,
    orgId: api.org_id,
    name: api.name,
    code: api.code,
    isEnabled: api.is_enabled,
    isActive: api.is_active,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}
