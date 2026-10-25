import { v2 as cloudinary } from "cloudinary";

interface CloudinaryUploadOptions {
  folder: string;
  publicId: string;
}

interface CloudinaryUploadResult {
  secureUrl: string;
}

export function uploadImageToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions,
): Promise<CloudinaryUploadResult> {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary no está configurado en la API.");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

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

        if (!result?.secure_url) {
          reject(new Error("Cloudinary no devolvió una URL segura."));
          return;
        }

        resolve({ secureUrl: result.secure_url });
      },
    );

    stream.end(buffer);
  });
}
