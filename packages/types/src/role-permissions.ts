import type { AppRole } from "./roles";
import type { Permission } from "./permissions";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  owner: [
    "dashboard.view",

    "orders.view",
    "orders.create",
    "orders.update",
    "orders.cancel",

    "menu.view",
    "menu.create",
    "menu.update",
    "menu.delete",

    "categories.manage",

    "disponibility.view",
    "disponibility.manage",

    "tables.view",
    "tables.manage",

    "customers.view",
    "customers.manage",

    "reservations.view",
    "reservations.manage",

    "kds.view",
    "kds.manage",

    "team.view",
    "team.invite",
    "team.update_role",
    "team.remove",

    "settings.view",
    "settings.update",

    "reports.view",
  ],

  admin: [
    "dashboard.view",

    "orders.view",
    "orders.create",
    "orders.update",
    "orders.cancel",

    "menu.view",
    "menu.create",
    "menu.update",
    "menu.delete",

    "categories.manage",

    "disponibility.view",
    "disponibility.manage",

    "tables.view",
    "tables.manage",

    "customers.view",
    "customers.manage",

    "reservations.view",
    "reservations.manage",

    "kds.view",
    "kds.manage",

    "team.view",
    "team.invite",
    "team.update_role",

    "settings.view",
    "settings.update",

    "reports.view",
  ],

  cashier: [
    "dashboard.view",

    "orders.view",
    "orders.create",
    "orders.update",

    "customers.view",
    "customers.manage",

    "tables.view",
  ],

  waiter: [
    "orders.view",
    "orders.create",
    "orders.update",

    "tables.view",

    "customers.view",

    "reservations.view",
    "reservations.manage",
  ],

  chef: [
    "orders.view",
    "kds.view",
    "kds.manage",
    "menu.view",
    "disponibility.view",
  ],
};
