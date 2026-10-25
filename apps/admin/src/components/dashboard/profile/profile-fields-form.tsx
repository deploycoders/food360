"use client";

import type { FormEvent } from "react";
import {
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

interface ProfileFieldsFormProps {
  email: string;
  fullName: string;
  phone: string;
  saving: boolean;
  uploadingAvatar: boolean;
  profileLoaded: boolean;
  onFullNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ProfileFieldsForm({
  email,
  fullName,
  phone,
  saving,
  uploadingAvatar,
  profileLoaded,
  onFullNameChange,
  onPhoneChange,
  onSubmit,
}: ProfileFieldsFormProps) {
  const disabled = saving || uploadingAvatar;

  return (
    <form onSubmit={onSubmit} className="border-t border-border">
      {/* Encabezado de la sección */}
      <div className="border-b border-border px-4 py-4 sm:px-7 lg:px-9">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <UserRound className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Información personal
            </h3>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Mantén tus datos actualizados para identificar tu cuenta dentro de
              Food360.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-5 sm:px-7 sm:py-7 lg:px-9">
        <div className="grid min-w-0 gap-5 sm:grid-cols-2 sm:gap-6">
          {/* Nombre completo */}
          <div className="min-w-0">
            <label
              htmlFor="profile-full-name"
              className="mb-2 block text-xs font-semibold text-foreground"
            >
              Nombre completo
            </label>

            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="profile-full-name"
                type="text"
                required
                maxLength={120}
                autoComplete="name"
                value={fullName}
                onChange={(event) => onFullNameChange(event.target.value)}
                disabled={disabled}
                placeholder="Tu nombre completo"
                className="h-11 w-full min-w-0 rounded-xl border border-input bg-background pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Correo electrónico: solo lectura */}
          <div className="min-w-0">
            <label
              htmlFor="profile-email"
              className="mb-2 block text-xs font-semibold text-foreground"
            >
              Correo electrónico
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="profile-email"
                type="email"
                readOnly
                value={email}
                className="h-11 w-full min-w-0 cursor-not-allowed rounded-xl border border-input bg-muted/40 pl-10 pr-3 text-sm text-muted-foreground outline-none"
              />
            </div>

            <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
              El correo se administra mediante la autenticación de tu cuenta.
            </p>
          </div>

          {/* Teléfono */}
          <div className="min-w-0 sm:col-span-2">
            <label
              htmlFor="profile-phone"
              className="mb-2 block text-xs font-semibold text-foreground"
            >
              Teléfono{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </label>

            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
                value={phone}
                onChange={(event) => onPhoneChange(event.target.value)}
                disabled={disabled}
                placeholder="Tu número de teléfono"
                className="h-11 w-full min-w-0 rounded-xl border border-input bg-background pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Acciones y nota de privacidad */}
        <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2.5 text-[11px] leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />

            <p>
              Tu perfil personal es independiente de la configuración del
              restaurante.
            </p>
          </div>

          <button
            type="submit"
            disabled={disabled || !fullName.trim()}
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-xs font-semibold text-accent-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {saving ? "Guardando cambios..." : "Guardar cambios"}
          </button>
        </div>

        {profileLoaded && (
          <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            Perfil vinculado a tu cuenta autenticada.
          </p>
        )}
      </div>
    </form>
  );
}
