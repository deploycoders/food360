import { Router, type Request, type Response } from "express";
import { supabaseAdmin } from "@food360/database";
import { hasPermission, type AppRole, type Permission } from "@food360/types";
import { createHash, randomBytes } from "node:crypto";

export const teamRouter: Router = Router();

// ─────────────────────────────────────────────
// Types locales del router
// ─────────────────────────────────────────────

const ASSIGNABLE_TEAM_ROLES = ["admin", "chef", "waiter", "cashier"] as const;

type AssignableTeamRole = (typeof ASSIGNABLE_TEAM_ROLES)[number];

interface CreateTeamInvitationBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  role?: unknown;
}

interface UpdateTeamMemberStatusBody {
  isActive?: unknown;
}

interface UpdateTeamMemberRoleBody {
  role?: unknown;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getRestaurantId(req: Request): string | null {
  return req.restaurantId ?? null;
}

function requirePermission(
  req: Request,
  res: Response,
  permission: Permission,
): boolean {
  const role = req.userRole as AppRole | undefined;

  if (!role || !hasPermission(role, permission)) {
    res.status(403).json({
      success: false,
      error: "No tienes permisos para realizar esta acción.",
    });

    return false;
  }

  return true;
}

function isAssignableRole(value: unknown): value is AssignableTeamRole {
  return (
    typeof value === "string" &&
    ASSIGNABLE_TEAM_ROLES.some((role) => role === value)
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

const INVITATION_EXPIRY_DAYS = 7;

function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

function getInvitationUrl(token: string): string {
  const baseUrl = process.env.FOOD360_ADMIN_URL;

  if (!baseUrl) {
    throw new Error("Falta configurar FOOD360_ADMIN_URL.");
  }

  return `${baseUrl.replace(/\/+$/, "")}/invite/${token}`;
}

// ─────────────────────────────────────────────
// GET /api/v1/team
// Listar miembros del restaurante
// ─────────────────────────────────────────────

teamRouter.get("/", async (req: Request, res: Response) => {
  if (!requirePermission(req, res, "team.view")) return;

  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "No se pudo identificar el restaurante.",
    });
  }

  try {
    const { data: memberships, error: membersError } = await supabaseAdmin
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

    if (membersError) throw membersError;

    if (!memberships?.length) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const userIds = Array.from(
      new Set(memberships.map((member) => member.user_id)),
    );

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, phone, avatar_url")
      .in("id", userIds);

    if (profilesError) throw profilesError;

    const profilesById = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile]),
    );

    const members = memberships.map((member) => ({
      ...member,
      profile: profilesById.get(member.user_id) ?? null,
    }));

    return res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("GET /team failed:", error);

    return res.status(500).json({
      success: false,
      error: "No se pudo cargar el equipo.",
    });
  }
});

async function getAuthenticatedUserId(req: Request): Promise<string> {
  const authorization = req.headers.authorization;

  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    throw new Error("No se encontró el token de autenticación.");
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("No se pudo identificar al usuario autenticado.");
  }

  return data.user.id;
}

// ─────────────────────────────────────────────
// POST /api/v1/team/invitations
// Crear miembro o generar enlace de invitación
// ─────────────────────────────────────────────

// GET /api/v1/team/invitations
// Listar invitaciones del restaurante autenticado.
teamRouter.get("/invitations", async (req: Request, res: Response) => {
  if (!requirePermission(req, res, "team.view")) return;

  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "No se pudo identificar el restaurante.",
    });
  }

  try {
    const now = new Date().toISOString();

    const { error: expireError } = await supabaseAdmin
      .from("team_invitations")
      .update({ status: "expired", updated_at: now })
      .eq("restaurant_id", restaurantId)
      .eq("status", "pending")
      .lte("expires_at", now);

    if (expireError) throw expireError;

    const { data, error } = await supabaseAdmin
      .from("team_invitations")
      .select(
        "id, restaurant_id, email, full_name, phone, role, status, expires_at, accepted_at, accepted_user_id, created_at, updated_at",
      )
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error("GET /team/invitations failed:", error);

    return res.status(500).json({
      success: false,
      error: "No se pudieron cargar las invitaciones.",
    });
  }
});

// POST /api/v1/team/invitations
// Crear una invitación persistente.
teamRouter.post(
  "/invitations",
  async (
    req: Request<Record<string, string>, unknown, CreateTeamInvitationBody>,
    res: Response,
  ) => {
    if (!requirePermission(req, res, "team.invite")) return;

    const restaurantId = getRestaurantId(req);

    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        error: "No se pudo identificar el restaurante.",
      });
    }

    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof req.body?.phone === "string" ? req.body.phone.trim() : "";

    const role = req.body?.role;

    if (
      !name ||
      name.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.length > 40 ||
      !isAssignableRole(role)
    ) {
      return res.status(400).json({
        success: false,
        error: "Revisa el nombre, correo, teléfono y rol.",
      });
    }

    if (role === "admin" && req.userRole !== "owner") {
      return res.status(403).json({
        success: false,
        error: "Solo el propietario puede invitar administradores.",
      });
    }

    const baseUrl = process.env.FOOD360_ADMIN_URL;

    if (!baseUrl) {
      return res.status(500).json({
        success: false,
        error: "Falta configurar FOOD360_ADMIN_URL en el backend.",
      });
    }

    try {
      const invitedBy = await getAuthenticatedUserId(req);
      const now = new Date().toISOString();

      // Evitar generar varias invitaciones simultáneas para el mismo correo.
      const { data: pending, error: pendingError } = await supabaseAdmin
        .from("team_invitations")
        .select("id")
        .eq("restaurant_id", restaurantId)
        .eq("email", email)
        .eq("status", "pending")
        .gt("expires_at", now)
        .maybeSingle();

      if (pendingError) throw pendingError;

      if (pending) {
        return res.status(409).json({
          success: false,
          error:
            "Ya hay una invitación pendiente para este correo. Puedes generar un enlace nuevo desde la lista de invitaciones.",
        });
      }

      // Si ya existe una cuenta de Food360, se puede añadir al restaurante
      // sin crear una segunda cuenta de autenticación.
      const { data: existingProfile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .ilike("email", email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (existingProfile) {
        const { data: existingMembership, error: membershipError } =
          await supabaseAdmin
            .from("restaurant_members")
            .select("id, role, is_active")
            .eq("restaurant_id", restaurantId)
            .eq("user_id", existingProfile.id)
            .maybeSingle();

        if (membershipError) throw membershipError;

        if (existingMembership?.is_active) {
          return res.status(409).json({
            success: false,
            error: "Esta persona ya pertenece a este restaurante.",
          });
        }

        if (existingMembership) {
          const { data: updated, error: updateError } = await supabaseAdmin
            .from("restaurant_members")
            .update({
              role,
              is_active: true,
              updated_at: now,
            })
            .eq("id", existingMembership.id)
            .select("id")
            .single();

          if (updateError) throw updateError;

          return res.status(200).json({
            success: true,
            data: {
              invitationId: null,
              memberId: updated.id,
              email,
              name: existingProfile.full_name || name,
              role,
              accountAlreadyExists: true,
              inviteUrl: null,
              expiresAt: null,
              status: "accepted",
            },
          });
        }

        const { data: membership, error: insertError } = await supabaseAdmin
          .from("restaurant_members")
          .insert({
            restaurant_id: restaurantId,
            user_id: existingProfile.id,
            role,
            is_active: true,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        return res.status(201).json({
          success: true,
          data: {
            invitationId: null,
            memberId: membership.id,
            email,
            name: existingProfile.full_name || name,
            role,
            accountAlreadyExists: true,
            inviteUrl: null,
            expiresAt: null,
            status: "accepted",
          },
        });
      }

      // Cuenta nueva: crear un token aleatorio y guardar solamente su hash.
      const token = createInvitationToken();
      const tokenHash = hashInvitationToken(token);

      const expiresAt = new Date(
        Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();

      const inviteUrl = getInvitationUrl(token);

      const { data: invitation, error: insertError } = await supabaseAdmin
        .from("team_invitations")
        .insert({
          restaurant_id: restaurantId,
          invited_by: invitedBy,
          email,
          full_name: name,
          phone: phone || null,
          role,
          token_hash: tokenHash,
          status: "pending",
          expires_at: expiresAt,
        })
        .select("id, created_at, expires_at, status")
        .single();

      if (insertError) throw insertError;

      return res.status(201).json({
        success: true,
        data: {
          invitationId: invitation.id,
          memberId: null,
          email,
          name,
          role,
          accountAlreadyExists: false,
          inviteUrl,
          expiresAt: invitation.expires_at,
          status: invitation.status,
        },
      });
    } catch (error) {
      console.error("POST /team/invitations failed:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo crear la invitación.",
      });
    }
  },
);

// POST /api/v1/team/invitations/:id/link
// Generar un enlace nuevo e invalidar el anterior.
teamRouter.post(
  "/invitations/:id/link",
  async (req: Request<{ id: string }>, res: Response) => {
    if (!requirePermission(req, res, "team.invite")) return;

    const restaurantId = getRestaurantId(req);
    const { id } = req.params;

    if (!restaurantId || !isUuid(id)) {
      return res.status(400).json({
        success: false,
        error: "El restaurante o la invitación no son válidos.",
      });
    }

    if (!process.env.FOOD360_ADMIN_URL) {
      return res.status(500).json({
        success: false,
        error: "Falta configurar FOOD360_ADMIN_URL.",
      });
    }

    try {
      const { data: invitation, error: lookupError } = await supabaseAdmin
        .from("team_invitations")
        .select("id, status")
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (!invitation) {
        return res.status(404).json({
          success: false,
          error: "No se encontró la invitación.",
        });
      }

      if (!["pending", "expired"].includes(invitation.status)) {
        return res.status(409).json({
          success: false,
          error: "Esta invitación ya no se puede renovar.",
        });
      }

      const token = createInvitationToken();
      const tokenHash = hashInvitationToken(token);

      const expiresAt = new Date(
        Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data, error: updateError } = await supabaseAdmin
        .from("team_invitations")
        .update({
          token_hash: tokenHash,
          expires_at: expiresAt,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .in("status", ["pending", "expired"])
        .select("id, expires_at")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!data) {
        return res.status(409).json({
          success: false,
          error: "La invitación cambió de estado. Actualiza la lista.",
        });
      }

      return res.json({
        success: true,
        data: {
          invitationId: data.id,
          inviteUrl: getInvitationUrl(token),
          expiresAt: data.expires_at,
        },
      });
    } catch (error) {
      console.error("POST /team/invitations/:id/link failed:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo generar un enlace nuevo.",
      });
    }
  },
);

// POST /api/v1/team/invitations/:id/revoke
teamRouter.post(
  "/invitations/:id/revoke",
  async (req: Request<{ id: string }>, res: Response) => {
    if (!requirePermission(req, res, "team.invite")) return;

    const restaurantId = getRestaurantId(req);
    const { id } = req.params;

    if (!restaurantId || !isUuid(id)) {
      return res.status(400).json({
        success: false,
        error: "El restaurante o la invitación no son válidos.",
      });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("team_invitations")
        .update({
          status: "revoked",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .in("status", ["pending", "expired"])
        .select("id, status")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.status(409).json({
          success: false,
          error: "La invitación no existe o ya no se puede revocar.",
        });
      }

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("POST /team/invitations/:id/revoke failed:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo revocar la invitación.",
      });
    }
  },
);

// ─────────────────────────────────────────────
// PATCH /api/v1/team/:id/status
// Activar o desactivar un miembro
// ─────────────────────────────────────────────

teamRouter.patch(
  "/:id/status",
  async (
    req: Request<{ id: string }, unknown, UpdateTeamMemberStatusBody>,
    res: Response,
  ) => {
    // Según las reglas actuales, solo el owner puede hacerlo.
    if (req.userRole !== "owner") {
      return res.status(403).json({
        success: false,
        error: "Solo el propietario puede cambiar el estado de los miembros.",
      });
    }

    const restaurantId = getRestaurantId(req);
    const { id } = req.params;
    const { isActive } = req.body;

    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        error: "No se pudo identificar el restaurante.",
      });
    }

    if (!isUuid(id) || typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "El identificador o el estado no es válido.",
      });
    }

    try {
      const { data: member, error: memberError } = await supabaseAdmin
        .from("restaurant_members")
        .select("id, role")
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!member) {
        return res.status(404).json({
          success: false,
          error: "No se encontró el miembro en este restaurante.",
        });
      }

      if (member.role === "owner") {
        return res.status(403).json({
          success: false,
          error: "No se puede modificar el estado del propietario.",
        });
      }

      const { data, error: updateError } = await supabaseAdmin
        .from("restaurant_members")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .select("id, is_active")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!data) {
        return res.status(404).json({
          success: false,
          error: "No se pudo actualizar el miembro.",
        });
      }

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("PATCH /team/:id/status failed:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo actualizar el estado del miembro.",
      });
    }
  },
);

// ─────────────────────────────────────────────
// PATCH /api/v1/team/:id/role
// Modificar el rol de un miembro
// ─────────────────────────────────────────────

teamRouter.patch(
  "/:id/role",
  async (
    req: Request<{ id: string }, unknown, UpdateTeamMemberRoleBody>,
    res: Response,
  ) => {
    if (!requirePermission(req, res, "team.update_role")) return;

    const restaurantId = getRestaurantId(req);
    const { id } = req.params;
    const role = req.body?.role;

    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        error: "No se pudo identificar el restaurante.",
      });
    }

    if (!isUuid(id) || !isAssignableRole(role)) {
      return res.status(400).json({
        success: false,
        error: "El identificador o el rol no es válido.",
      });
    }

    if (role === "admin" && req.userRole !== "owner") {
      return res.status(403).json({
        success: false,
        error: "Solo el propietario puede asignar el rol admin.",
      });
    }

    try {
      const { data: member, error: memberError } = await supabaseAdmin
        .from("restaurant_members")
        .select("id, role")
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!member) {
        return res.status(404).json({
          success: false,
          error: "No se encontró el miembro en este restaurante.",
        });
      }

      if (member.role === "owner") {
        return res.status(403).json({
          success: false,
          error: "No se puede cambiar el rol del propietario.",
        });
      }

      const { data, error: updateError } = await supabaseAdmin
        .from("restaurant_members")
        .update({
          role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .select("id, role")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!data) {
        return res.status(404).json({
          success: false,
          error: "No se pudo actualizar el rol del miembro.",
        });
      }

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("PATCH /team/:id/role failed:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo actualizar el rol del miembro.",
      });
    }
  },
);

// ─────────────────────────────────────────────
// DELETE /api/v1/team/:id
// Eliminar pertenencia al restaurante
// ─────────────────────────────────────────────

teamRouter.delete(
  "/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    if (!requirePermission(req, res, "team.remove")) return;

    const restaurantId = getRestaurantId(req);
    const { id } = req.params;

    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        error: "No se pudo identificar el restaurante.",
      });
    }

    if (!isUuid(id)) {
      return res.status(400).json({
        success: false,
        error: "El identificador del miembro no es válido.",
      });
    }

    try {
      const { data: member, error: memberError } = await supabaseAdmin
        .from("restaurant_members")
        .select("id, role")
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!member) {
        return res.status(404).json({
          success: false,
          error: "No se encontró el miembro en este restaurante.",
        });
      }

      if (member.role === "owner") {
        return res.status(403).json({
          success: false,
          error: "No se puede eliminar la pertenencia del propietario.",
        });
      }

      const { error: deleteError } = await supabaseAdmin
        .from("restaurant_members")
        .delete()
        .eq("id", id)
        .eq("restaurant_id", restaurantId);

      if (deleteError) throw deleteError;

      return res.json({
        success: true,
        data: { id },
      });
    } catch (error) {
      console.error("DELETE /team/:id failed:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo eliminar la pertenencia del miembro.",
      });
    }
  },
);
