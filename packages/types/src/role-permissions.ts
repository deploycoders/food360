import type { AppRole } from "./roles";
import type { Permission } from "./permissions";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  // ─────────────────────────────────────────────
  // OWNER
  // ─────────────────────────────────────────────
  owner: [
    "dashboard.view",

    // Orders
    "orders.view",
    "orders.create",
    "orders.update",
    "orders.cancel",

    // Menu
    "menu.view",
    "menu.create",
    "menu.update",
    "menu.delete",

    // Categories
    "categories.manage",

    // Availability
    "disponibility.view",
    "disponibility.manage",

    // Tables
    "tables.view",
    "tables.manage",

    // Customers
    "customers.view",
    "customers.manage",

    // Reservations
    "reservations.view",
    "reservations.manage",

    // KDS
    "kds.view",
    "kds.manage",

    // Team
    "team.view",
    "team.invite",
    "team.update_role",
    "team.remove",

    // Settings
    "settings.view",
    "settings.update",

    // Reports
    "reports.view",
  ],

  // ─────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────
  admin: [
    "dashboard.view",

    // Orders
    "orders.view",
    "orders.create",
    "orders.update",
    "orders.cancel",

    // Menu
    "menu.view",
    "menu.create",
    "menu.update",
    "menu.delete",

    // Categories
    "categories.manage",

    // Availability
    "disponibility.view",
    "disponibility.manage",

    // Tables
    "tables.view",
    "tables.manage",

    // Customers
    "customers.view",
    "customers.manage",

    // Reservations
    "reservations.view",
    "reservations.manage",

    // KDS
    "kds.view",
    "kds.manage",

    // Team
    "team.view",
    "team.invite",
    "team.update_role",

    // Settings
    "settings.view",
    "settings.update",

    // Reports
    "reports.view",
  ],

  // ─────────────────────────────────────────────
  // CASHIER
  // ─────────────────────────────────────────────
  cashier: [
    "dashboard.view",

    // Orders
    "orders.view",
    "orders.create",
    "orders.update",

    // Customers
    "customers.view",
    "customers.manage",

    // Tables
    "tables.view",
  ],

  // ─────────────────────────────────────────────
  // WAITER
  // ─────────────────────────────────────────────
  waiter: [
    // Orders
    "orders.view",
    "orders.create",
    "orders.update",

    // Tables
    "tables.view",

    // Customers
    "customers.view",

    // Reservations
    "reservations.view",
    "reservations.manage",
  ],

  // ─────────────────────────────────────────────
  // CHEF
  // ─────────────────────────────────────────────
  chef: [
    // KDS
    "kds.view",
    "kds.manage",

    // Menu
    "menu.view",

    // Availability
    "disponibility.view",
    "disponibility.manage",
  ],
};
