import { randomUUID } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { hasPermission } from "@food360/types";

import { uploadImageToCloudinary } from "../lib/cloudinary";
import { receiveImage } from "../lib/image-upload";

export const uploadsRouter: Router = Router();

// POST /api/v1/uploads/image
// Product images belong to the authenticated restaurant.
uploadsRouter.post(
  "/image",
  receiveImage,
  async (req: Request, res: Response) => {
    if (
      !hasPermission(req.userRole, "menu.create") &&
      !hasPermission(req.userRole, "menu.update")
    ) {
      return res.status(403).json({
        success: false,
        error: "No tienes permisos para subir imágenes del menú.",
      });
    }

    if (!req.restaurantId || !req.file) {
      return res.status(400).json({
        success: false,
        error: "No se pudo identificar el restaurante o la imagen.",
      });
    }

    try {
      const result = await uploadImageToCloudinary(req.file.buffer, {
        folder: `food360/restaurants/${req.restaurantId}`,
        publicId: `image-${randomUUID()}`,
      });

      return res.status(201).json({
        success: true,
        data: { secure_url: result.secureUrl },
      });
    } catch (error) {
      console.error("POST /uploads/image failed:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo subir la imagen. Inténtalo de nuevo.",
      });
    }
  },
);
