interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadImageToCloudinary(
  file: File,
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch("/api/upload/image", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo subir la imagen.");
  }

  return data;
}
