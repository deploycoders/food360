import { createClient } from "@supabase/supabase-js";

import type { AppRole } from "@food360/types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export async function verifyAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Token de acceso requerido",
    });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({
      error: "Sesión inválida o expirada",
    });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("restaurant_members")
    .select("restaurant_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    console.error("Error obteniendo membresía:", membershipError);

    return res.status(500).json({
      error: "No se pudo verificar la membresía del usuario",
    });
  }

  if (!membership) {
    return res.status(403).json({
      error: "El usuario no pertenece a ningún restaurante",
    });
  }

  // Usuario autenticado
  req.user = user;

  // Contexto del restaurante
  req.restaurantId = membership.restaurant_id;

  // Rol obtenido desde restaurant_members
  req.userRole = membership.role as AppRole;

  next();
}

// Middleware guardián por roles
export function requireRole(allowedRoles: AppRole[]) {
  return (req: any, res: any, next: any) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        error: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
}
