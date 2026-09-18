import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen." },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "La imagen no puede superar los 5 MB." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
    }>((resolve, reject) => {
      console.log("Cloudinary config:", {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
        apiSecret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
      });
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "food360/products",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary no devolvió un resultado."));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        },
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("ERROR CLOUDINARY:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al subir la imagen.",
      },
      { status: 500 },
    );
  }
}
