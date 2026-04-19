/**
 * `OrgAdmin` is a membership row — it identifies a user who administers a
 * specific organization. Backend tables: `orgs_admins` joined with `users`.
 */
export interface OrgAdmin {
  organizationId: string;
  userId: string;
  avatarPath: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}
