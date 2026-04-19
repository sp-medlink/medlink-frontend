export type { PlatformAdmin } from "./model/types";
export { platformAdminKeys } from "./api/keys";
export {
  fetchPlatformAdmins,
  addPlatformAdmin,
  removePlatformAdmin,
} from "./api/platform-admins.api";
export { platformAdminsQuery } from "./api/queries";
