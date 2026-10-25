"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { ThemeToggle } from "@food360/theme";
import { createClient } from "@/lib/supabase/client";
import { useLogout } from "@/lib/hooks/use-logout";
import {
  getMyProfile,
  PROFILE_UPDATED_EVENT,
} from "@/services/profile.service";
import type { UserProfile } from "@/types/profile";

const ROUTE_MAP: Record<string, { title: string; category?: string }> = {
  "/": { title: "Dashboard", category: "Principal" },
  "/orders": { title: "Órdenes & Comandas", category: "Principal" },
  "/menu": { title: "Platillos & Carta", category: "Gestión de Menú" },
  "/menu/categories": { title: "Categorías", category: "Gestión de Menú" },
  "/menu/disponibility": {
    title: "Disponibilidad",
    category: "Gestión de Menú",
  },
  "/team": { title: "Personal & Equipo", category: "Administración" },
  "/settings": { title: "Configuración", category: "Administración" },
  "/profile": { title: "Mi Perfil", category: "Cuenta" },
  "/kds": { title: "Pantalla KDS", category: "Cocina" },
};

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar?: () => void;
}

function getUserDisplayName(
  profile: UserProfile | null,
  user: SupabaseUser | null,
): string {
  if (profile?.fullName.trim()) return profile.fullName.trim();
  if (!user) return "Mi cuenta";

  const metadata = user.user_metadata;

  const fullName =
    typeof metadata?.full_name === "string" ? metadata.full_name.trim() : "";

  const displayName =
    typeof metadata?.name === "string" ? metadata.name.trim() : "";

  return fullName || displayName || user.email?.split("@")[0] || "Mi cuenta";
}

function getUserInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "U";
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();

  const supabase = useMemo(() => createClient(), []);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const profileRef = useRef<UserProfile | null>(null);

  const currentSection = ROUTE_MAP[pathname] || {
    title: "Panel CMS",
    category: "Food360",
  };

  const displayName = getUserDisplayName(userProfile, authUser);
  const email = userProfile?.email ?? authUser?.email ?? "";
  const initials = getUserInitials(displayName);

  const { logout } = useLogout();

  // Obtener el usuario real de Supabase Auth.
  useEffect(() => {
    let mounted = true;

    const updateProfile = (profile: UserProfile | null) => {
      profileRef.current = profile;
      setUserProfile(profile);
    };

    async function loadProfile(userId: string) {
      try {
        const profile = await getMyProfile();
        if (mounted && profile.id === userId) updateProfile(profile);
      } catch (error) {
        if (mounted) {
          console.error("Error cargando el perfil del header:", error);
        }
      }
    }

    async function loadUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error) {
          console.error("Error cargando usuario del header:", error);
          setAuthUser(null);
          updateProfile(null);
        } else {
          setAuthUser(user);
          if (user) await loadProfile(user.id);
          else updateProfile(null);
        }
      } catch (error) {
        if (!mounted) return;

        console.error("Error inesperado cargando el usuario:", error);
        setAuthUser(null);
      } finally {
        if (mounted) setUserLoading(false);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setAuthUser(session?.user ?? null);
      setUserLoading(false);

      if (!session) {
        updateProfile(null);
      } else if (
        _event === "SIGNED_IN" &&
        profileRef.current?.id !== session.user.id
      ) {
        void loadProfile(session.user.id);
      }
    });

    const handleProfileUpdated = (event: Event) => {
      const profile = (event as CustomEvent<UserProfile>).detail;
      if (profile) updateProfile(profile);
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    };
  }, [supabase]);

  // Cerrar el desplegable al navegar a otra pantalla.
  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setIsProfileOpen(false);
    await logout();
  }

  return (
    <header
      className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md transition-all duration-300 sm:px-6 ${
        isSidebarOpen
          ? "pointer-events-none -translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* Izquierda: breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          {currentSection.category && (
            <>
              <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                {currentSection.category}
              </span>

              <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/60 sm:inline" />
            </>
          )}

          <h1 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
            {currentSection.title}
          </h1>
        </div>
      </div>

      {/* Derecha: tema, notificaciones y usuario */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <button
          type="button"
          className="relative rounded-xl border border-transparent p-2 text-muted-foreground transition-all duration-200 hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
          title="Notificaciones"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="mx-1 hidden h-4 w-px bg-border sm:block" />

        {/* Menú del perfil */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((open) => !open)}
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-all duration-200 hover:border-border hover:bg-muted"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-xs font-bold text-accent"
              aria-hidden="true"
            >
              {userProfile?.avatarUrl ? (
                <Image
                  src={userProfile.avatarUrl}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : userLoading ? "…" : initials}
            </div>

            <div className="hidden max-w-40 text-left md:block">
              <p className="truncate text-xs font-semibold leading-none text-foreground">
                {userLoading ? "Cargando..." : displayName}
              </p>

              <p className="mt-1 truncate text-[10px] leading-none text-muted-foreground">
                {userLoading ? "" : email || "Cuenta autenticada"}
              </p>
            </div>

            <ChevronDown
              className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <>
              <button
                type="button"
                aria-label="Cerrar menú de usuario"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsProfileOpen(false)}
              />

              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card py-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Identidad del usuario */}
                <div className="border-b border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-accent/20 bg-accent/10 text-sm font-bold text-accent">
                      {userProfile?.avatarUrl ? (
                        <Image
                          src={userProfile.avatarUrl}
                          alt=""
                          width={40}
                          height={40}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : userLoading ? "…" : initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {userLoading ? "Cargando usuario..." : displayName}
                      </p>

                      <p className="mt-1 break-all text-[11px] text-muted-foreground">
                        {email || (userLoading ? "" : "Correo no disponible")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-1">
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    <span>Mi perfil</span>
                  </Link>

                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </div>

                <div className="mx-3 h-px bg-border" />

                <div className="p-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
