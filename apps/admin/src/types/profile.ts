export type ProfileRole =
  | "owner"
  | "admin"
  | "chef"
  | "waiter"
  | "cashier"
  | "mesero"
  | "cajero";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role?: ProfileRole | null;
}

export interface UpdateUserProfileInput {
  fullName: string;
  phone: string | null;
}
