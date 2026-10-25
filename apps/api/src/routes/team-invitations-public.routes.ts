import { createHash } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { supabaseAdmin } from "@food360/database";

export const teamInvitationAcceptRouter: Router = Router();

interface AcceptInvitationBody {
  token?: unknown;
  password?: unknown;
}

interface ValidateInvitationBody {
  token?: unknown;
}

const ASSIGNABLE_ROLES = ["admin", "chef", "waiter", "cashier"] as const;

function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isAssignableRole(
  role: string,
): role is (typeof ASSIGNABLE_ROLES)[number] {
  return ASSIGNABLE_ROLES.some((item) => item === role);
}

function isDuplicateAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  return (
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("already exists")
  );
}

async function findInvitation(token: string) {
  return supabaseAdmin
    .from("team_invitations")
    .select("id, email, full_name, role, status, expires_at, token_hash")
    .eq("token_hash", hashInvitationToken(token))
    .maybeSingle();
}

teamInvitationAcceptRouter.post(
  "/validate",
  async (
    req: Request<Record<string, string>, unknown, ValidateInvitationBody>,
    res: Response,
  ) => {
    const token =
      typeof req.body?.token === "string" ? req.body.token.trim() : "";

    if (!token || token.length > 256) {
      return res.status(400).json({
        success: false,
        error: "El enlace de invitación no es válido.",
      });
    }

    try {
      const { data: invitation, error } = await findInvitation(token);
      if (error) throw error;

      if (!invitation || invitation.status !== "pending") {
        return res.status(410).json({
          success: false,
          error: "Esta invitación ya no está disponible.",
        });
      }

      if (new Date(invitation.expires_at).getTime() <= Date.now()) {
        const { error: expireError } = await supabaseAdmin
          .from("team_invitations")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("id", invitation.id)
          .eq("token_hash", invitation.token_hash)
          .eq("status", "pending");

        if (expireError) throw expireError;
        return res.status(410).json({
          success: false,
          error: "La invitación ha caducado. Solicita un enlace nuevo.",
        });
      }

      if (!isAssignableRole(invitation.role)) {
        return res.status(400).json({
          success: false,
          error: "El rol de la invitación no es válido.",
        });
      }

      return res.json({
        success: true,
        data: {
          email: invitation.email,
          name: invitation.full_name,
          role: invitation.role,
          expiresAt: invitation.expires_at,
        },
      });
    } catch (error) {
      console.error("POST /team/invitations/accept/validate failed:", error);
      return res.status(500).json({
        success: false,
        error: "No se pudo validar la invitación. Inténtalo de nuevo.",
      });
    }
  },
);

teamInvitationAcceptRouter.post(
  "/",
  async (
    req: Request<Record<string, string>, unknown, AcceptInvitationBody>,
    res: Response,
  ) => {
    const token =
      typeof req.body?.token === "string" ? req.body.token.trim() : "";

    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!token || token.length > 256) {
      return res.status(400).json({
        success: false,
        error: "El enlace de invitación no es válido.",
      });
    }

    if (password.length < 10 || password.length > 128) {
      return res.status(400).json({
        success: false,
        error: "La contraseña debe tener entre 10 y 128 caracteres.",
      });
    }

    let createdUserId: string | null = null;
    let createdMembershipId: string | null = null;
    let restaurantId: string | null = null;

    try {
      const tokenHash = hashInvitationToken(token);

      const { data: invitation, error: lookupError } = await supabaseAdmin
        .from("team_invitations")
        .select(
          "id, restaurant_id, email, full_name, phone, role, status, expires_at, token_hash",
        )
        .eq("token_hash", tokenHash)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (!invitation) {
        return res.status(400).json({
          success: false,
          error: "El enlace es inválido o ya no está disponible.",
        });
      }

      if (invitation.status !== "pending") {
        return res.status(410).json({
          success: false,
          error: "Esta invitación ya se utilizó o fue revocada.",
        });
      }

      if (new Date(invitation.expires_at).getTime() <= Date.now()) {
        const { error: expireError } = await supabaseAdmin
          .from("team_invitations")
          .update({
            status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("id", invitation.id)
          .eq("token_hash", tokenHash)
          .eq("status", "pending");

        if (expireError) throw expireError;

        return res.status(410).json({
          success: false,
          error: "La invitación ha caducado. Solicita un enlace nuevo.",
        });
      }

      if (!isAssignableRole(invitation.role)) {
        return res.status(400).json({
          success: false,
          error: "El rol de la invitación no es válido.",
        });
      }

      restaurantId = invitation.restaurant_id;

      // El token de invitación es una credencial de acceso.
      // El invitado establece aquí su propia contraseña.
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: invitation.email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: invitation.full_name,
            phone: invitation.phone,
          },
        });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Supabase no devolvió el usuario creado.");
      }

      createdUserId = authData.user.id;

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: createdUserId,
            email: invitation.email,
            full_name: invitation.full_name,
            phone: invitation.phone,
          },
          { onConflict: "id" },
        );

      if (profileError) throw profileError;

      const { data: membership, error: membershipError } = await supabaseAdmin
        .from("restaurant_members")
        .insert({
          restaurant_id: invitation.restaurant_id,
          user_id: createdUserId,
          role: invitation.role,
          is_active: true,
        })
        .select("id")
        .single();

      if (membershipError) throw membershipError;

      createdMembershipId = membership.id;

      const { data: acceptedInvitation, error: acceptError } =
        await supabaseAdmin
          .from("team_invitations")
          .update({
            status: "accepted",
            accepted_at: new Date().toISOString(),
            accepted_user_id: createdUserId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", invitation.id)
          .eq("status", "pending")
          .eq("token_hash", tokenHash)
          .gt("expires_at", new Date().toISOString())
          .select("id")
          .maybeSingle();

      if (acceptError) throw acceptError;

      if (!acceptedInvitation) {
        throw new Error("INVITATION_ALREADY_USED");
      }

      return res.status(201).json({
        success: true,
        data: {
          email: invitation.email,
          name: invitation.full_name,
          restaurantId: invitation.restaurant_id,
          role: invitation.role,
        },
      });
    } catch (error) {
      console.error("POST /team/invitations/accept failed:", error);

      // Intentar revertir las operaciones parciales.
      if (createdMembershipId && restaurantId) {
        const { error: cleanupMembershipError } = await supabaseAdmin
          .from("restaurant_members")
          .delete()
          .eq("id", createdMembershipId)
          .eq("restaurant_id", restaurantId);

        if (cleanupMembershipError) {
          console.error(
            "Could not clean up restaurant membership:",
            cleanupMembershipError,
          );
        }
      }

      if (createdUserId) {
        const { error: cleanupUserError } =
          await supabaseAdmin.auth.admin.deleteUser(createdUserId);

        if (cleanupUserError) {
          console.error("Could not clean up Auth user:", cleanupUserError);
        }
      }

      if (isDuplicateAuthError(error)) {
        return res.status(409).json({
          success: false,
          error:
            "Ya existe una cuenta con este correo. Inicia sesión con esa cuenta para gestionar tu acceso.",
        });
      }

      if (
        error instanceof Error &&
        error.message === "INVITATION_ALREADY_USED"
      ) {
        return res.status(409).json({
          success: false,
          error: "Esta invitación ya fue utilizada.",
        });
      }

      return res.status(500).json({
        success: false,
        error: "No se pudo completar la aceptación de la invitación.",
      });
    }
  },
);
