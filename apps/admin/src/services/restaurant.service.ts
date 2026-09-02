import { createClient } from "@/lib/supabase/client";

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

export const restaurantService = {
  async getById(id: string): Promise<Restaurant | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }

      console.error("Error fetching restaurant:", error);
      throw error;
    }

    return data;
  },

  async getBySlug(slug: string): Promise<Restaurant | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }

      console.error("Error fetching restaurant:", error);
      throw error;
    }

    return data;
  },

  async getAll(): Promise<Restaurant[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching restaurants:", error);
      throw error;
    }

    return data ?? [];
  },
};
