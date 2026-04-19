/**
 * AdminUser is the platform-admin's view of a `users` row. Mirrors the
 * shape returned by `/user/admin/users` which ships the user's base
 * roles as a flat array so the UI can badge patients / doctors / admins
 * without an extra round-trip.
 */
export interface AdminUser {
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
  roles: string[];
  createdAt: string;
  updatedAt: string;
}
