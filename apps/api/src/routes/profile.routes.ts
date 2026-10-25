import { Router, type Request, type Response } from "express";
import { supabaseAdmin } from "@food360/database";
import { receiveImage } from "../lib/image-upload";
import { uploadImageToCloudinary } from "../lib/cloudinary";

export const profileRouter: Router = Router();

interface UpdateProfileBody {
  fullName?: unknown;
  phone?: unknown;
}

async function getAuthenticatedUser(req: Request) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error) return null;

  return data.user ?? null;
}

function getMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toProfile(
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null,
  user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>,
  role: string | null,
) {
  return {
    id: user.id,
    email: user.email ?? profile?.email ?? "",
    fullName:
      profile?.full_name ??
      getMetadataString(user.user_metadata, "full_name") ??
      user.email?.split("@")[0] ??
      "",
    phone: profile?.phone ?? getMetadataString(user.user_metadata, "phone"),
    avatarUrl:
      profile?.avatar_url ??
      getMetadataString(user.user_metadata, "avatar_url"),
    role,
  };
}

// GET /api/v1/profile/me
profileRouter.get("/me", async (req: Request, res: Response) => {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Tu sesión no es válida. Inicia sesión de nuevo.",
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, phone, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;

    return res.json({
      success: true,
      data: toProfile(data, user, req.userRole ?? null),
    });
  } catch (error) {
    console.error("GET /profile/me failed:", error);

    return res.status(500).json({
      success: false,
      error: "No se pudo cargar tu perfil.",
    });
  }
});

// PATCH /api/v1/profile/me
profileRouter.patch(
  "/me",
  async (
    req: Request<Record<string, string>, unknown, UpdateProfileBody>,
    res: Response,
  ) => {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Tu sesión no es válida. Inicia sesión de nuevo.",
      });
    }

    const body = req.body ?? {};

    if (body.fullName === undefined && body.phone === undefined) {
      return res.status(400).json({
        success: false,
        error: "No hay cambios que guardar.",
      });
    }

    if (
      body.fullName !== undefined &&
      (typeof body.fullName !== "string" ||
        !body.fullName.trim() ||
        body.fullName.trim().length > 120)
    ) {
      return res.status(400).json({
        success: false,
        error: "El nombre es obligatorio y no puede superar 120 caracteres.",
      });
    }

    if (
      body.phone !== undefined &&
      body.phone !== null &&
      (typeof body.phone !== "string" || body.phone.trim().length > 40)
    ) {
      return res.status(400).json({
        success: false,
        error: "El teléfono no puede superar 40 caracteres.",
      });
    }

    try {
      const { data: currentProfile, error: lookupError } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (lookupError) throw lookupError;

      const fullName =
        typeof body.fullName === "string"
          ? body.fullName.trim()
          : (currentProfile?.full_name ??
            getMetadataString(user.user_metadata, "full_name") ??
            user.email?.split("@")[0] ??
            "");

      const phone =
        body.phone === undefined
          ? (currentProfile?.phone ??
            getMetadataString(user.user_metadata, "phone"))
          : typeof body.phone === "string" && body.phone.trim()
            ? body.phone.trim()
            : null;

      const email = user.email ?? currentProfile?.email ?? "";

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Tu cuenta no tiene un correo electrónico disponible.",
        });
      }

      const { data: savedProfile, error: saveError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email,
            full_name: fullName,
            phone,
            avatar_url:
              currentProfile?.avatar_url ??
              getMetadataString(user.user_metadata, "avatar_url"),
          },
          { onConflict: "id" },
        )
        .select("id, email, full_name, phone, avatar_url")
        .single();

      if (saveError) throw saveError;

      // Mantener sincronizados los metadatos que usa el menú superior.
      const { error: metadataError } =
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            full_name: fullName,
            phone,
          },
        });

      if (metadataError) {
        console.error(
          "Profile saved, but auth metadata could not be synchronized:",
          metadataError,
        );
      }

      return res.json({
        success: true,
        data: toProfile(savedProfile, user, req.userRole ?? null),
      });
    } catch (error) {
      console.error("PATCH /profile/me failed:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo guardar tu perfil.",
      });
    }
  },
);

// PUT /api/v1/profile/me/avatar
profileRouter.put(
  "/me/avatar",
  receiveImage,
  async (req: Request, res: Response) => {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Tu sesión no es válida. Inicia sesión de nuevo.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No se recibió una imagen válida.",
      });
    }

    try {
      const { secureUrl: avatarUrl } = await uploadImageToCloudinary(
        req.file.buffer,
        {
          folder: `food360/profiles/${user.id}`,
          publicId: "avatar",
        },
      );

      const { data: currentProfile, error: profileLookupError } =
        await supabaseAdmin
          .from("profiles")
          .select("id, email, full_name, phone")
          .eq("id", user.id)
          .maybeSingle();

      if (profileLookupError) throw profileLookupError;

      const email = user.email ?? currentProfile?.email ?? "";

      if (!email) {
        throw new Error("No se encontró el correo asociado al perfil.");
      }

      const { data: savedProfile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email,
            full_name:
              currentProfile?.full_name ??
              getMetadataString(user.user_metadata, "full_name") ??
              "",
            phone:
              currentProfile?.phone ??
              getMetadataString(user.user_metadata, "phone"),
            avatar_url: avatarUrl,
          },
          { onConflict: "id" },
        )
        .select("id, email, full_name, phone, avatar_url")
        .single();

      if (profileError) throw profileError;

      const { error: metadataError } =
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            avatar_url: avatarUrl,
          },
        });

      if (metadataError) {
        console.error(
          "Avatar saved, but auth metadata could not be synchronized:",
          metadataError,
        );
      }

      return res.json({
        success: true,
        data: toProfile(savedProfile, user, req.userRole ?? null),
      });
    } catch (error) {
      console.error("PUT /profile/me/avatar failed:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo guardar la foto de perfil.",
      });
    }
  },
);
