export type AppRole = "owner" | "admin" | "cashier" | "waiter" | "chef";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}
