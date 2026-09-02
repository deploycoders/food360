import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AppRole } from "@food360/types";

export interface UserContext {
  userId: string;

  restaurantId: string;

  role: AppRole;

  email: string;

  fullName: string;
}

export async function getUserContext(): Promise<UserContext | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      full_name,
      email,
      active_restaurant_id
    `,
    )
    .eq("id", user.id)
    .single();

  if (!profile?.active_restaurant_id) {
    return null;
  }

  const { data: membership } = await supabase
    .from("restaurant_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("restaurant_id", profile.active_restaurant_id)
    .single();

  if (!membership) {
    return null;
  }

  return {
    userId: user.id,

    restaurantId: profile.active_restaurant_id,

    role: membership.role,

    email: profile.email,

    fullName: profile.full_name,
  };
}
