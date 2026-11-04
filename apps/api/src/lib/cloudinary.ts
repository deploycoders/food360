import { v2 as cloudinary } from "cloudinary";

interface CloudinaryUploadOptions {
  folder: string;
  publicId: string;
}

interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

function configureCloudinary(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary no está configurado en la API.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export function uploadImageToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions,
): Promise<CloudinaryUploadResult> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url || !result.public_id) {
          reject(
            new Error(
              "Cloudinary no devolvió los datos necesarios de la imagen.",
            ),
          );
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });
}

export async function deleteImageFromCloudinary(
  publicId: string,
): Promise<void> {
  if (!publicId.trim()) {
    throw new Error("El identificador de la imagen es obligatorio.");
  }

  configureCloudinary();

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary no pudo eliminar la imagen: ${result.result}`);
  }
}
