export const APP_ROLES = [
  "owner",
  "admin",
  "chef",
  "waiter",
  "cashier",
] as const;

export type AppRole = (typeof APP_ROLES)[number];
