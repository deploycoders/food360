"use client";

import { createBrowserClient } from "@supabase/ssr";

export function useLogout() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return { logout };
}
