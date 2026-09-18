"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react";

import { uploadImageToCloudinary } from "@/services/cloudinary.service";

interface CloudinaryImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  error?: string;
  disabled?: boolean;
}

export function CloudinaryImageUpload({
  value,
  onChange,
  error: externalError,
  disabled = false,
}: CloudinaryImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const error = externalError || uploadError;

  const openFilePicker = () => {
    if (disabled || uploading) return;

    inputRef.current?.click();
  };

  const handleSelectImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadError(null);

    if (!file.type.startsWith("image/")) {
      setUploadError("Selecciona un archivo de imagen válido.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setUploadError("La imagen no puede superar los 5 MB.");
      return;
    }

    try {
      setUploading(true);

      const result = await uploadImageToCloudinary(file);

      onChange(result.secure_url);
    } catch (error) {
      console.error(error);

      setUploadError(
        error instanceof Error ? error.message : "No se pudo subir la imagen.",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    if (disabled || uploading) return;

    onChange(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="space-y-2">
          {/* Preview */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
            <img
              src={value}
              alt="Imagen del producto"
              className="aspect-video w-full object-cover"
            />

            {/* Acciones sobre la imagen */}
            <div className="absolute right-2 top-2 flex items-center gap-1.5">
              {/* Cambiar imagen */}
              <button
                type="button"
                onClick={openFilePicker}
                disabled={disabled || uploading}
                title="Cambiar imagen"
                className="flex h-8 items-center cursor-pointer gap-1.5 rounded-xl border border-border bg-background/90 px-2.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition-all hover:bg-background hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}

                <span>{uploading ? "Subiendo..." : "Cambiar"}</span>
              </button>

              {/* Eliminar imagen */}
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || uploading}
                title="Eliminar imagen"
                className="flex h-8 w-8 items-center cursor-pointer justify-center rounded-xl border border-border bg-background/90 text-foreground shadow-sm backdrop-blur transition-all hover:bg-background hover:text-destructive hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Overlay durante subida */}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background/95 px-3 py-2 text-xs font-medium text-foreground shadow-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  Subiendo imagen...
                </div>
              </div>
            )}
          </div>

          {/* Ayuda */}
          {!uploading && (
            <p className="text-[11px] text-muted-foreground">
              Puedes cambiar la imagen directamente o eliminarla.
            </p>
          )}
        </div>
      ) : (
        /* Empty state */
        <button
          type="button"
          onClick={openFilePicker}
          disabled={disabled || uploading}
          className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-muted-foreground transition-all duration-200 hover:border-accent hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-accent" />

              <span className="mt-2 text-xs font-medium text-foreground">
                Subiendo imagen...
              </span>

              <span className="mt-1 text-[11px] text-muted-foreground">
                Espera un momento
              </span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />

              <span className="mt-2 text-xs font-medium text-foreground">
                Seleccionar imagen
              </span>

              <span className="mt-1 text-[11px] text-muted-foreground">
                JPG, PNG o WebP · Máximo 5 MB
              </span>
            </>
          )}
        </button>
      )}

      {/* Input real */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelectImage}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Error */}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
          {error}
        </p>
      )}
    </div>
  );
}
