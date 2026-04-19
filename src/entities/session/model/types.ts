import type { AppRole, BaseRole } from "@/shared/config";

export interface SessionUser {
  id: string;
  avatarPath: string;
  firstName: string;
  lastName: string;
  iin: string;
  phoneNumber: string;
  email: string;
  birthDate: string;
  gender: string;
  address: string;
  roles: BaseRole[];
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  token: string;
  expiresAt: number;
  user: SessionUser | null;
}

export type { AppRole, BaseRole };
