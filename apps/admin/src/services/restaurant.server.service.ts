import { createClient } from "@/lib/supabase/server";

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  instagram_url: string | null;
  google_business_url: string | null;
  created_at: string;
}

export const restaurantServerService = {
  async getCurrent(): Promise<Restaurant | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("restaurants")
      .select("id, name, slug, custom_domain, instagram_url, google_business_url, created_at")
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
      .select("id, name, slug, custom_domain, instagram_url, google_business_url, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching restaurant:", error);
      throw error;
    }

    return data;
  },
};
