import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const createSupabaseAnonClient = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url)
    throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required");
  if (!key)
    throw new Error(
      "SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required",
    );

  return createClient(url, key);
};

export const createSupabaseServiceRoleClient = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url)
    throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

let supabaseAdminInstance: SupabaseClient | undefined;

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    supabaseAdminInstance ??= createSupabaseServiceRoleClient();
    const value = Reflect.get(supabaseAdminInstance, property, receiver);
    return typeof value === "function"
      ? value.bind(supabaseAdminInstance)
      : value;
  },
});
