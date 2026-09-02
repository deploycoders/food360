import type { AppRole } from "./roles";

export interface RestaurantMember {
  id: string;

  restaurant_id: string;

  user_id: string;

  role: AppRole;

  created_at: string;

  updated_at: string;
}
