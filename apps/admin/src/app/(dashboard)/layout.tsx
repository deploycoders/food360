import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { AppRole } from "@food360/types";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: AppRole = "admin";

  if (user) {
    const { data: membership } = await supabase
      .from("restaurant_members")
      .select("role")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membership?.role) {
      userRole = membership.role as AppRole;
    }
  }

  return <DashboardShell userRole={userRole}>{children}</DashboardShell>;
}
