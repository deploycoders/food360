import { createClient, type User } from "@supabase/supabase-js";
import type { NextFunction, Request, Response } from "express";

import type { AppRole } from "@food360/types";

// ============================================================
// Express Request Context
// ============================================================

declare global {
  namespace Express {
    interface Request {
      user: User;
      restaurantId: string;
      userRole: AppRole;
    }
  }
}

// ============================================================
// Auth Middleware
// ============================================================

export async function verifyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token de acceso requerido",
      });
    }

    const token = authorization.substring("Bearer ".length).trim();

    if (!token) {
      return res.status(401).json({
        error: "Token de acceso requerido",
      });
    }

    // Cliente autenticado con el token de la request.
    // Esto permite que las consultas posteriores respeten RLS.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );

    // ----------------------------------------------------------
    // 1. Verificar usuario
    // ----------------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({
        error: "Sesión inválida o expirada",
      });
    }

    // ----------------------------------------------------------
    // 2. Obtener membresía del restaurante
    // ----------------------------------------------------------

    const { data: membership, error: membershipError } = await supabase
      .from("restaurant_members")
      .select("restaurant_id, role")
      .eq("user_id", user.id)
      .eq("is_active", true)
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

    // ----------------------------------------------------------
    // 3. Construir contexto autenticado
    // ----------------------------------------------------------

    req.user = user;
    req.restaurantId = membership.restaurant_id;
    req.userRole = membership.role as AppRole;

    next();
  } catch (error) {
    console.error("Error en verifyAuth:", error);

    return res.status(500).json({
      error: "Error interno de autenticación",
    });
  }
}

// ============================================================
// Role Middleware
// ============================================================

export function requireRole(allowedRoles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        error: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
}
