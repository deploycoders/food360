import { createClient } from "@/lib/supabase/server";

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  wifi_ssid: string | null;
  wifi_password: string | null;
  instagram_url: string | null;
  google_business_url: string | null;
  payment_info: Record<string, unknown>;
  created_at: string;
}

export const restaurantServerService = {
  async getCurrent(): Promise<Restaurant | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching current restaurant:", error);
      throw error;
    }

    return data;
  },

  async getById(id: string): Promise<Restaurant | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching restaurant:", error);
      throw error;
    }

    return data;
  },
};
