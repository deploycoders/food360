"use client";

import React, { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { hasPermission, type AppRole, type Permission } from "@food360/types";
import { useLogout } from "@/lib/hooks/useLogout";

interface SidebarProps {
  userRole?: AppRole;
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
        label: "Control de Stock",
        href: "/menu/stock",
        icon: Boxes,
        permission: "stock.view",
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

export function Sidebar({ userRole = "admin" }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  const filteredNavigation = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        hasPermission(userRole, item.permission),
      ),
    }))
    .filter((section) => section.items.length > 0);

  const canAccessKDS = hasPermission(userRole, "kds.view");

  return (
    <>
      {/* Botón Flotante Hamburguesa (Solo en Pantallas Pequeñas) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
        className="lg:hidden fixed bottom-5 right-5 z-50 p-3.5 rounded-full bg-accent text-accent-foreground shadow-xl shadow-accent/30 border border-accent/40 active:scale-95 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay Oscuro para Cerrar en Móvil */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col justify-between shrink-0 h-screen transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Header Sidebar */}
          <div className="p-5 flex items-center justify-between border-b border-border">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                <Flame className="w-5 h-5 fill-accent/20" />
              </div>

              <div>
                <span className="font-bold text-lg text-foreground block leading-none">
                  Food<span className="text-accent">360</span>
                </span>

                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Panel CMS
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Action: KDS */}
          {canAccessKDS && (
            <div className="p-3">
              <Link
                href="/kds"
                target="_blank"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md bg-accent hover:bg-accent/80 text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  Pantalla KDS
                </span>

                <ExternalLink className="w-3.5 h-3.5 text-white/80" />
              </Link>
            </div>
          )}

          {/* Links Nav */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
            {filteredNavigation.map((section) => (
              <div key={section.title} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
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
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-muted text-accent font-semibold border border-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? "text-accent" : "text-muted-foreground"
                            }`}
                          />

                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-accent/15 text-accent border border-accent/25">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="py-4 px-3 border-t border-border">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full cursor-pointer px-3.5 py-2.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2.5"
          >
            <LogOut className="w-4 h-4 text-destructive" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
