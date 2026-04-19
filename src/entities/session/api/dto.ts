import type { BaseRole } from "@/shared/config";

export interface MeApiUser {
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
  roles: BaseRole[];
  created_at: string;
  updated_at: string;
}

export interface MeApiResponse {
  user: MeApiUser;
}
