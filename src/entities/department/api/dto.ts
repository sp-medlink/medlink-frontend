export interface DepartmentDto {
  id: string;
  org_id: string;
  name: string;
  code: string;
  is_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentsListResponse {
  departments: DepartmentDto[];
}

export interface DepartmentResponse {
  department: DepartmentDto;
}

export interface CreateDepartmentResponse {
  department_id: string;
}

export interface DepartmentMutateBody {
  name: string;
  code: string;
}

export interface DepartmentStatusBody {
  is_active: boolean;
}
