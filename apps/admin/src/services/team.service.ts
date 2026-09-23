import { createClient } from "@/lib/supabase/client";

export interface TeamMemberRow {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: "owner" | "admin" | "chef" | "waiter" | "cashier";
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
}

export async function getTeamMembers(
  restaurantId: string,
): Promise<TeamMemberRow[]> {
  const supabase = createClient();

  // 1. Obtener los miembros del restaurante
  const { data: memberships, error: membersError } = await supabase
    .from("restaurant_members")
    .select(
      `
        id,
        restaurant_id,
        user_id,
        role,
        is_active,
        last_seen_at,
        created_at,
        updated_at
      `,
    )
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: true });

  if (membersError) {
    console.error("Error loading team members:", membersError);

    throw membersError;
  }

  if (!memberships || memberships.length === 0) {
    return [];
  }

  // 2. Obtener los perfiles correspondientes
  const userIds = memberships.map((member) => member.user_id);

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(
      `
        id,
        email,
        full_name,
        phone,
        avatar_url
      `,
    )
    .in("id", userIds);

  if (profilesError) {
    console.error("Error loading team profiles:", profilesError);

    throw profilesError;
  }

  // 3. Crear mapa user_id -> profile
  const profilesMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  // 4. Combinar membership + profile
  return memberships.map((member) => ({
    id: member.id,
    restaurant_id: member.restaurant_id,
    user_id: member.user_id,
    role: member.role,
    is_active: member.is_active,
    last_seen_at: member.last_seen_at,
    created_at: member.created_at,
    updated_at: member.updated_at,
    profile: profilesMap.get(member.user_id) ?? null,
  }));
}

export async function updateTeamMemberStatus(
  membershipId: string,
  isActive: boolean,
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("restaurant_members")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", membershipId)
    .select("id, is_active")
    .single();

  if (error) {
    console.error("Error updating team member status:", error);

    throw error;
  }

  return data;
}
