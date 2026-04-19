/**
 * Platform admin = a user who holds the `admin` base role (row in
 * `users_roles` with the admin role_id). This is distinct from `OrgAdmin`,
 * which is a data-ownership relationship.
 */
export interface PlatformAdmin {
  userId: string;
  avatarPath: string;
  firstName: string;
  lastName: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
}
