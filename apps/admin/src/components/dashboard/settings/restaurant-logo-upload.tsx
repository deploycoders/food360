"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";

import { configurationService } from "@/services/configuration.service";

interface RestaurantLogoUploadProps {
  value?: string;
  onChange: (logoUrl: string | undefined) => void;
}

export function RestaurantLogoUpload({
  value,
  onChange,
}: RestaurantLogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = uploading || removing;

  async function handleSelectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);

    const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!acceptedTypes.includes(file.type)) {
      setError("Selecciona una imagen JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const logoUrl = await configurationService.uploadRestaurantLogo(file);

      onChange(logoUrl);
    } catch (err) {
      console.error("Error subiendo logo:", err);

      setError(
        err instanceof Error ? err.message : "No se pudo subir el logo.",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleRemove() {
    if (busy || !value) return;

    setError(null);

    try {
      setRemoving(true);

      await configurationService.deleteRestaurantLogo();

      onChange(undefined);
    } catch (err) {
      console.error("Error eliminando logo:", err);

      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el logo.",
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/30">
        {value ? (
          <img
            src={value}
            alt="Logo del restaurante"
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus className="h-7 w-7" />
            <span className="text-[10px] font-medium">Sin logo</span>
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <LoaderCircle className="h-6 w-6 animate-spin text-accent" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-xs font-semibold text-foreground">
            Logo del establecimiento
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Identifica visualmente tu restaurante en Food360 y en tu página
            pública.
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            JPG, PNG o WebP · Máximo 5 MB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-9 items-center cursor-pointer gap-2 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {uploading ? "Subiendo..." : value ? "Cambiar logo" : "Subir logo"}
          </button>

          {value && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleRemove()}
              className="inline-flex h-9 items-center cursor-pointer gap-2 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
            >
              {removing ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Eliminar
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => void handleSelectImage(event)}
        disabled={busy}
        className="hidden"
      />
    </div>
  );
}
