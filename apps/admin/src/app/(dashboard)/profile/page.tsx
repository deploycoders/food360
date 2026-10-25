"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AlertCircle, UserRound } from "lucide-react";
import { toast } from "sonner";

import { ProfileFieldsForm } from "@/components/dashboard/profile/profile-fields-form";
import { ProfileHeaderCard } from "@/components/dashboard/profile/profile-header-card";
import { ProfilePageSkeleton } from "@/components/dashboard/profile/profile-page-skeleton";

import type { UserProfile } from "@/types/profile";

import {
  announceProfileUpdated,
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
} from "@/services/profile.service";

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Cargar el perfil real desde el backend.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const data = await getMyProfile();

        if (cancelled) return;

        setProfile(data);
        setFullName(data.fullName);
        setPhone(data.phone ?? "");
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "No se pudo cargar tu perfil.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // Guardar nombre y teléfono.
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving || uploadingAvatar) return;

    const normalizedName = fullName.trim();
    const normalizedPhone = phone.trim();

    if (!normalizedName) {
      toast.error("Introduce tu nombre completo.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await updateMyProfile({
        fullName: normalizedName,
        phone: normalizedPhone || null,
      });

      setProfile(updated);
      setFullName(updated.fullName);
      setPhone(updated.phone ?? "");

      // Sincronizar el perfil con el encabezado global.
      announceProfileUpdated(updated);

      toast.success("Perfil actualizado correctamente.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar tu perfil.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  // Validar y subir la fotografía.
  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Permite seleccionar nuevamente el mismo archivo.
    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Selecciona una imagen JPG, PNG o WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5 MB.");
      return;
    }

    if (saving || uploadingAvatar) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      const updated = await uploadMyAvatar(file);

      setProfile(updated);

      // Notificar el nuevo avatar al encabezado global.
      announceProfileUpdated(updated);

      toast.success("Foto de perfil actualizada.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo subir la foto.";

      setError(message);
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  const initials = getInitials(profile?.fullName ?? fullName);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <main className="w-full min-w-0 space-y-6 pb-6">
      {/* Título de la página */}
      <header className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
          <UserRound className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Mi perfil
          </h1>

          <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
            Administra tus datos personales y la información de tu cuenta.
          </p>
        </div>
      </header>

      {/* Mensaje de error */}
      {error && (
        <div
          role="alert"
          className="flex min-w-0 items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs leading-5 text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      {/* Tarjeta principal del perfil */}
      <section
        aria-label="Perfil personal"
        className="w-full min-w-0 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
      >
        <ProfileHeaderCard
          fullName={profile?.fullName ?? fullName}
          email={profile?.email ?? ""}
          phone={phone}
          role={profile?.role ?? null}
          avatarUrl={profile?.avatarUrl ?? null}
          initials={initials}
          uploadingAvatar={uploadingAvatar}
          disabled={saving}
          onAvatarChange={(event) => void handleAvatarChange(event)}
        />

        <ProfileFieldsForm
          email={profile?.email ?? ""}
          fullName={fullName}
          phone={phone}
          saving={saving}
          uploadingAvatar={uploadingAvatar}
          profileLoaded={Boolean(profile)}
          onFullNameChange={setFullName}
          onPhoneChange={setPhone}
          onSubmit={(event) => void handleSave(event)}
        />
      </section>

      {/* Nota de seguridad */}
      <p className="text-xs leading-5 text-muted-foreground">
        Para cambiar tu contraseña, utiliza la opción de seguridad de tu cuenta
        o el flujo «¿Olvidaste tu contraseña?» del inicio de sesión.
      </p>
    </main>
  );
}
