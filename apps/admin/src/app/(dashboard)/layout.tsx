import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AppRole } from "@food360/types";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

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

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar userRole={userRole} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
