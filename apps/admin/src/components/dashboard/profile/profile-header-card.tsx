"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { Camera, LoaderCircle, Mail, Phone, UserRound } from "lucide-react";

import { ProfileRoleBadge } from "./profile-role-badge";

import {
  DEFAULT_AVATAR_PALETTE,
  extractAvatarPalette,
  type AvatarPalette,
} from "./profile-color-palette";

interface ProfileHeaderCardProps {
  fullName: string;
  email: string;
  phone: string;
  role: string | null;
  avatarUrl: string | null;
  initials: string;
  uploadingAvatar: boolean;
  disabled: boolean;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface AvatarViewProps {
  avatarUrl: string | null;
  fullName: string;
  initials: string;
  onChangePhoto: () => void;
  uploadingAvatar: boolean;
  disabled: boolean;
  size: "mobile" | "desktop";
}

function AvatarView({
  avatarUrl,
  fullName,
  initials,
  onChangePhoto,
  uploadingAvatar,
  disabled,
  size,
}: AvatarViewProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  const canShowAvatar = Boolean(avatarUrl) && !imageFailed;
  const isDesktop = size === "desktop";

  return (
    <div
      className={`
        relative shrink-0 rounded-full bg-card p-1
        shadow-lg ring-1 ring-black/10
        ${isDesktop ? "h-28 w-28" : "h-24 w-24"}
      `}
    >
      <div
        className={`
          relative flex h-full w-full items-center justify-center
          overflow-hidden rounded-full bg-accent/15
          font-bold text-accent
          ${isDesktop ? "text-3xl" : "text-2xl"}
        `}
      >
        {canShowAvatar ? (
          <Image
            src={avatarUrl!}
            alt={`Foto de perfil de ${fullName || "tu cuenta"}`}
            fill
            sizes={isDesktop ? "112px" : "96px"}
            unoptimized
            onError={() => setImageFailed(true)}
            className="object-cover"
          />
        ) : (
          <span aria-hidden="true">
            {initials || <UserRound className="h-9 w-9" />}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onChangePhoto}
        disabled={disabled || uploadingAvatar}
        aria-label="Cambiar foto de perfil"
        title="Cambiar foto de perfil"
        className="
          absolute bottom-1 right-1 z-10
          inline-flex h-8 w-8 items-center justify-center
          rounded-full border-2 border-card
          bg-foreground text-background shadow-md
          transition hover:scale-105
          disabled:cursor-not-allowed disabled:opacity-60
        "
      >
        {uploadingAvatar ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export function ProfileHeaderCard({
  fullName,
  email,
  phone,
  avatarUrl,
  initials,
  uploadingAvatar,
  disabled,
  role,
  onAvatarChange,
}: ProfileHeaderCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [palette, setPalette] = useState<AvatarPalette>(DEFAULT_AVATAR_PALETTE);

  useEffect(() => {
    let cancelled = false;

    if (!avatarUrl) {
      setPalette(DEFAULT_AVATAR_PALETTE);

      return () => {
        cancelled = true;
      };
    }

    void extractAvatarPalette(avatarUrl).then((nextPalette) => {
      if (!cancelled) {
        setPalette(nextPalette);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [avatarUrl]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const normalizedName = fullName.trim() || "Tu perfil";

  return (
    <div className="min-w-0">
      {/* Banner dinámico */}
      <div
        className="
          relative isolate h-36 overflow-hidden
          sm:h-44
          landscape:md:h-56
          landscape:xl:h-64
        "
        style={{
          backgroundImage: `
            radial-gradient(
              ellipse at 12% 18%,
              ${palette.start} 0%,
              transparent 58%
            ),
            radial-gradient(
              ellipse at 82% 24%,
              ${palette.end} 0%,
              transparent 56%
            ),
            linear-gradient(
              112deg,
              ${palette.start} 0%,
              ${palette.middle} 52%,
              ${palette.end} 100%
            )
          `,
        }}
      >
        {/* Elementos decorativos */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute -right-12 -top-20
            h-56 w-56 rounded-full border border-white/30
            bg-white/10 blur-[1px]
            sm:h-72 sm:w-72
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute -bottom-24 left-[34%]
            h-48 w-48 rounded-full border border-white/25
            bg-white/10 blur-[1px]
            sm:h-64 sm:w-64
          "
        />

        {/* Sombra inferior para el texto en horizontal */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 hidden
            bg-gradient-to-t from-black/70 via-black/30 to-transparent
            landscape:md:block
          "
        />

        {/* ==================================================
            COMPOSICIÓN HORIZONTAL
            Avatar, identidad y acciones dentro del banner.
            ================================================== */}
        <div
          className="
            absolute inset-x-5 bottom-5 z-10
            hidden min-w-0 items-end gap-5
            landscape:md:flex
            landscape:xl:inset-x-11
            landscape:xl:bottom-7
            landscape:xl:gap-7
          "
        >
          <AvatarView
            size="desktop"
            avatarUrl={avatarUrl}
            fullName={fullName}
            initials={initials}
            onChangePhoto={openFilePicker}
            uploadingAvatar={uploadingAvatar}
            disabled={disabled}
          />

          <div className="min-w-0 flex-1 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
              Mi cuenta · Food360
            </p>

            <h2 className="mt-1 break-words text-2xl font-bold tracking-tight text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)] lg:text-3xl">
              {normalizedName}
            </h2>

            <div className="mt-2 flex w-full justify-start">
              <ProfileRoleBadge role={role} variant="banner" />
            </div>

            <div
              className="
                mt-2 flex flex-wrap items-center
                gap-x-5 gap-y-1.5 text-xs text-white/95
                drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]
              "
            >
              {phone.trim() && (
                <p className="flex min-w-0 items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span className="break-all">{phone}</span>
                </p>
              )}

              <p className="flex min-w-0 items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="break-all">{email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openFilePicker}
            disabled={disabled || uploadingAvatar}
            className="
              inline-flex h-10 shrink-0 items-center justify-center
              gap-2 self-end rounded-xl border border-white/25
              bg-black/25 px-4 text-xs font-semibold text-white
              shadow-lg backdrop-blur-md transition
              hover:bg-black/40
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {uploadingAvatar ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}

            {uploadingAvatar ? "Subiendo foto..." : "Cambiar foto"}
          </button>
        </div>
      </div>

      {/* ==================================================
          COMPOSICIÓN VERTICAL / MÓVIL
          Avatar centrado y datos debajo del banner.
          ================================================== */}
      <div
        className="
          relative min-w-0 px-4 pb-6 text-center
          sm:px-7 sm:pb-7
          lg:px-9
          landscape:md:hidden
        "
      >
        {/* Avatar centrado sobre el borde del banner */}
        <div
          className="
            absolute left-1/2 top-[-3rem] z-10
            -translate-x-1/2
            sm:top-[-3.5rem]
          "
        >
          <AvatarView
            size="mobile"
            avatarUrl={avatarUrl}
            fullName={fullName}
            initials={initials}
            onChangePhoto={openFilePicker}
            uploadingAvatar={uploadingAvatar}
            disabled={disabled}
          />
        </div>

        {/* Información centrada */}
        <div
          className="
            flex min-w-0 flex-col items-center gap-4
            pt-[4.25rem]
            sm:pt-[4.75rem]
          "
        >
          <div className="w-full min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Mi cuenta · Food360
            </p>

            <h2 className="mt-1 break-words text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {normalizedName}
            </h2>

            <div className="mt-2 flex w-full justify-center">
              <ProfileRoleBadge role={role} />
            </div>

            <div
              className="
                mt-3 flex min-w-0 flex-col items-center gap-2
                text-xs text-muted-foreground sm:text-sm
              "
            >
              {phone.trim() && (
                <p className="flex w-full min-w-0 items-start justify-center gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />

                  <span className="min-w-0 break-all text-left">{phone}</span>
                </p>
              )}

              <p className="flex w-full min-w-0 items-start justify-center gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />

                <span className="min-w-0 break-all text-left">{email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openFilePicker}
            disabled={disabled || uploadingAvatar}
            className="
              inline-flex h-9 w-fit shrink-0 items-center justify-center
              gap-2 rounded-xl border border-border bg-background/80
              px-3 text-xs font-semibold text-foreground
              transition hover:bg-muted
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {uploadingAvatar ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}

            {uploadingAvatar ? "Subiendo foto..." : "Cambiar foto"}
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] leading-5 text-muted-foreground">
          JPG, PNG o WebP · Máximo 5 MB. La foto se utiliza para identificarte
          en Food360.
        </p>
      </div>

      {/* Input compartido por ambas composiciones */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onAvatarChange}
        disabled={disabled || uploadingAvatar}
        className="sr-only"
        aria-label="Seleccionar nueva foto de perfil"
      />
    </div>
  );
}
