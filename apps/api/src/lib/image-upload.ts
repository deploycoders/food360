import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const parseSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
    fields: 0,
  },
  fileFilter: (_req, file, callback) => {
    if (!ACCEPTED_IMAGE_TYPES.has(file.mimetype)) {
      callback(new Error("La imagen debe ser JPG, PNG o WebP."));
      return;
    }

    callback(null, true);
  },
}).single("file");

export function receiveImage(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  parseSingleImage(req, res, (error) => {
    if (error) {
      const tooLarge =
        error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE";

      res.status(tooLarge ? 413 : 400).json({
        success: false,
        error: tooLarge
          ? "La imagen no puede superar los 5 MB."
          : error instanceof Error
            ? error.message
            : "No se pudo procesar la imagen.",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "Selecciona una imagen JPG, PNG o WebP.",
      });
      return;
    }

    next();
  });
}
