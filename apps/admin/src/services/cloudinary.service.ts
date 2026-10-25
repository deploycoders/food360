import { apiFetch } from "@/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
}

export async function uploadImageToCloudinary(
  file: File,
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiFetch<ApiResponse<CloudinaryUploadResponse>>(
    "/uploads/image",
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.success) {
    throw new Error(response.error || "No se pudo subir la imagen.");
  }

  return response.data;
}
