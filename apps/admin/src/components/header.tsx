"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@food360/theme";
import Link from "next/link";
import { useLogout } from "@/lib/hooks/useLogout";

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
  "/kds": { title: "Pantalla KDS", category: "Cocina" },
};

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar?: () => void;
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotifications] = useState(2);

  const currentSection = ROUTE_MAP[pathname] || {
    title: "Panel CMS",
    category: "Food360",
  };

  const { logout } = useLogout();

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  return (
    <header
      className={`h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-all duration-300 ${
        isSidebarOpen
          ? "pointer-events-none -translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* Izquierda: Breadcrumb Dinámico */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {currentSection.category && (
            <>
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                {currentSection.category}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 hidden sm:inline" />
            </>
          )}
          <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            {currentSection.title}
          </h1>
        </div>
      </div>

      {/* Derecha: Tema, Notificaciones y Perfil */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <button
          type="button"
          className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all duration-200 active:scale-95"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-4 ring-card" />
          )}
        </button>

        <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-muted border border-transparent hover:border-border transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 text-accent font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-foreground leading-none">
                Admin
              </p>
              <p className="text-[10px] text-muted-foreground leading-none mt-1">
                admin@food360.com
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-border md:hidden">
                  <p className="text-xs font-semibold text-foreground">Admin</p>
                  <p className="text-[10px] text-muted-foreground">
                    admin@food360.com
                  </p>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Mi Perfil</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Configuración</span>
                </Link>

                <div className="h-px bg-border my-1" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3.5 py-2 text-xs text-destructive hover:bg-destructive/10 flex items-center gap-2.5 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-destructive" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
