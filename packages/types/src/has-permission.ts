import type { AppRole } from "./roles";
import type { Permission } from "./permissions";
import { ROLE_PERMISSIONS } from "./role-permissions";

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
