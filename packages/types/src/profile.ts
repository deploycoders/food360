export interface Profile {
  id: string;

  email: string;

  full_name: string;

  avatar_url?: string | null;

  active_restaurant_id?: string | null;

  created_at: string;

  updated_at: string;
}
