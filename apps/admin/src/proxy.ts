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

export const ROLE_KDS_BACK_ROUTE: Record<AppRole, string> = {
  owner: "/",
  admin: "/",
  cashier: "/orders",
  waiter: "/orders",
  chef: "/menu",
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
    error: authError,
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isLoginRoute = path === "/login";
  const isForgotPasswordRoute = path === "/forgot-password";
  const isResetPasswordRoute = path === "/reset-password";
  const isOnboardingRoute =
    path === "/onboarding" || path.startsWith("/onboarding/");
  const isInviteRoute = /^\/invite\/[^/]+$/.test(path);

  const isPublicRoute =
    isLoginRoute ||
    isForgotPasswordRoute ||
    isResetPasswordRoute ||
    isInviteRoute;

  // =========================================================
  // 1. USUARIO NO AUTENTICADO
  // =========================================================

  if (authError || !user) {
    if (isPublicRoute) {
      return response;
    }

    const redirectUrl = new URL("/login", request.url);

    if (path !== "/" && !path.startsWith("/.") && !path.includes(".")) {
      redirectUrl.searchParams.set("redirectTo", path);
    }

    return NextResponse.redirect(redirectUrl);
  }

  // =========================================================
  // 2. USUARIO AUTENTICADO
  // =========================================================

  // Los enlaces de invitación se pueden abrir aunque el usuario
  // aún no tenga una membresía activa.
  if (isInviteRoute) {
    return response;
  }

  // Consultamos todas las membresías. No usamos limit(1), porque
  // el usuario podría tener varias y alguna podría estar inactiva.
  const { data: memberships, error: membershipError } = await supabase
    .from("restaurant_members")
    .select("role, restaurant_id, is_active")
    .eq("user_id", user.id);

  // ---------------------------------------------------------
  // ERROR AL CONSULTAR MEMBRESÍAS
  // ---------------------------------------------------------

  if (membershipError) {
    console.error(
      "Error verificando las membresías del usuario:",
      membershipError,
    );

    // Permitimos que login/onboarding muestren el estado correspondiente.
    // Las rutas de negocio siguen bloqueadas hasta poder verificar acceso.
    if (isLoginRoute || isOnboardingRoute) {
      return response;
    }

    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", "membership_check_failed");

    return NextResponse.redirect(redirectUrl);
  }

  const activeMembership = (memberships ?? []).find(
    (membership) => membership.is_active,
  );

  // ---------------------------------------------------------
  // USUARIO SIN NINGUNA MEMBRESÍA
  // ---------------------------------------------------------

  if (!activeMembership) {
    const hasInactiveMembership = (memberships ?? []).length > 0;

    // Tiene registros de membresía, pero ninguno está activo.
    // No debe crear un restaurante nuevo para saltarse la desactivación.
    if (hasInactiveMembership) {
      if (isLoginRoute) {
        return response;
      }

      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("error", "account_disabled");

      return NextResponse.redirect(redirectUrl);
    }

    // No tiene ninguna membresía: onboarding es la ruta permitida.
    if (isOnboardingRoute) {
      return response;
    }

    // Incluye /login: quien ya inició sesión y no tiene restaurante
    // debe continuar con el onboarding, no quedarse en el login.
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // =========================================================
  // 3. USUARIO CON MEMBRESÍA ACTIVA
  // =========================================================

  const role = activeMembership.role as AppRole;

  // Si ya tiene restaurante, no necesita crear otro desde onboarding.
  if (isOnboardingRoute || isLoginRoute) {
    return NextResponse.redirect(
      new URL(ROLE_DEFAULT_REDIRECT[role], request.url),
    );
  }

  // =========================================================
  // 4. VALIDAR PERMISOS DE RUTA
  // =========================================================

  const requiredPermission: Permission | undefined = ROUTE_PERMISSIONS[path];

  if (requiredPermission) {
    const allowed = hasPermission(role, requiredPermission);

    if (!allowed) {
      return NextResponse.redirect(
        new URL(ROLE_DEFAULT_REDIRECT[role], request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|json)$).*)",
  ],
};
