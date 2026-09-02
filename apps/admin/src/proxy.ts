import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasPermission, type AppRole, type Permission } from "@food360/types";
import { ROUTE_PERMISSIONS } from "@/app/lib/permissions/route-permissions";

const ROLE_DEFAULT_REDIRECT: Record<AppRole, string> = {
  owner: "/",
  admin: "/",
  cashier: "/orders",
  waiter: "/orders",
  chef: "/kds",
};

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),

        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value }) => {
            response.cookies.set(name, value);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isPublicRoute = path === "/login";

  // 1. Usuario NO autenticado
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);

    if (path !== "/" && !path.startsWith("/.") && !path.includes(".")) {
      redirectUrl.searchParams.set("redirectTo", path);
    }

    return NextResponse.redirect(redirectUrl);
  }

  // 2. Usuario autenticado
  if (user) {
    const { data: membership, error: membershipError } = await supabase
      .from("restaurant_members")
      .select("role, restaurant_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership) {
      console.error("User has no restaurant membership:", membershipError);

      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = membership.role as AppRole;

    // Usuario autenticado intentando entrar al login
    if (isPublicRoute) {
      return NextResponse.redirect(
        new URL(ROLE_DEFAULT_REDIRECT[role], request.url),
      );
    }

    const requiredPermission: Permission | undefined = ROUTE_PERMISSIONS[path];

    if (requiredPermission) {
      const allowed = hasPermission(role, requiredPermission);

      if (!allowed) {
        return NextResponse.redirect(
          new URL(ROLE_DEFAULT_REDIRECT[role], request.url),
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|json)$).*)",
  ],
};
