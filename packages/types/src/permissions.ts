export const PERMISSIONS = [
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

  "stock.view",
  "stock.manage",

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
] as const;

export type Permission = (typeof PERMISSIONS)[number];
