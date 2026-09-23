"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tags,
  Boxes,
  Users,
  Settings,
  ExternalLink,
  LogOut,
  Flame,
  X,
} from "lucide-react";

import { hasPermission, type AppRole, type Permission } from "@food360/types";

import { useLogout } from "@/lib/hooks/use-logout";

interface SidebarProps {
  userRole?: AppRole;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  permission: Permission;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "PRINCIPAL",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        permission: "dashboard.view",
      },
      {
        label: "Órdenes",
        href: "/orders",
        icon: ShoppingBag,
        badge: 3,
        permission: "orders.view",
      },
    ],
  },
  {
    title: "GESTIÓN DE MENÚ",
    items: [
      {
        label: "Platillos & Carta",
        href: "/menu",
        icon: UtensilsCrossed,
        permission: "menu.view",
      },
      {
        label: "Categorías",
        href: "/menu/categories",
        icon: Tags,
        permission: "categories.manage",
      },
      {
        label: "Disponibilidad",
        href: "/menu/disponibility",
        icon: Boxes,
        permission: "disponibility.view",
      },
    ],
  },
  {
    title: "ADMINISTRACIÓN",
    items: [
      {
        label: "Personal & Equipo",
        href: "/team",
        icon: Users,
        permission: "team.view",
      },
      {
        label: "Configuración",
        href: "/settings",
        icon: Settings,
        permission: "settings.view",
      },
    ],
  },
];

export function Sidebar({ userRole = "admin", isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useLogout();

  const filteredNavigation = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        hasPermission(userRole, item.permission),
      ),
    }))
    .filter((section) => section.items.length > 0);

  const canAccessKDS = hasPermission(userRole, "kds.view");

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <>
      {/* Overlay móvil */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-64 shrink-0 flex-col
          border-r border-border bg-card
          transition-transform duration-300 ease-out

          lg:sticky lg:z-30
          lg:translate-x-0

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Navegación principal"
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <div className="rounded-xl border border-accent/20 bg-accent/10 p-2 text-accent">
              <Flame className="h-5 w-5 fill-accent/20" />
            </div>

            <div>
              <span className="block text-lg font-bold leading-none text-foreground">
                Food<span className="text-accent">360</span>
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Panel CMS
              </span>
            </div>
          </Link>

          {/* Cerrar sidebar en móvil */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Action: KDS */}
        {canAccessKDS && (
          <div className="p-3">
            <Link
              href="/kds"
              target="_blank"
              onClick={onClose}
              className="flex w-full items-center justify-between rounded-md bg-accent px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-accent/20 transition-all hover:bg-accent/80 active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Pantalla KDS
              </span>

              <ExternalLink className="h-3.5 w-3.5 text-white/80" />
            </Link>
          </div>
        )}

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-6">
            {filteredNavigation.map((section) => (
              <div key={section.title} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>

                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                      item.href === "/menu"
                        ? pathname === "/menu"
                        : pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center justify-between
                          rounded-lg px-3 py-2
                          text-xs font-medium
                          transition-colors

                          ${
                            isActive
                              ? "border border-border bg-muted font-semibold text-accent"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`
                              h-4 w-4
                              ${
                                isActive
                                  ? "text-accent"
                                  : "text-muted-foreground"
                              }
                            `}
                          />

                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span className="rounded-full border border-accent/25 bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 text-destructive" />

            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
