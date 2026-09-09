import type { Permission } from "@food360/types";

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/": "dashboard.view",

  "/orders": "orders.view",

  "/menu": "menu.view",
  "/menu/categories": "categories.manage",
  "/menu/disponibility": "disponibility.view",

  "/team": "team.view",

  "/settings": "settings.view",

  "/kds": "kds.view",
};
