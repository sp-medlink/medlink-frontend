export interface AdminUserDto {
  id: string;
  avatar_path: string;
  first_name: string;
  last_name: string;
  iin: string;
  phone_number: string;
  email: string;
  birth_date: string;
  gender: string;
  address: string;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminUsersListResponse {
  users: AdminUserDto[];
}

export interface AdminUserResponse {
  user: AdminUserDto;
}
