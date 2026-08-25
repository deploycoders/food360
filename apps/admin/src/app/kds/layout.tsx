"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChefHat,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  ArrowLeft,
} from "lucide-react";

export default function KDSLayout({ children }: { children: React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const station = "Cocina General & Brasas";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden select-none transition-colors duration-200">
      {/* Header Adaptativo */}
      <header className="h-14 sm:h-16 bg-card border-b border-border px-3 sm:px-6 flex items-center justify-between shrink-0 z-50 gap-2">
        {/* Izquierda: Volver y Estación */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/"
            className="p-2 sm:px-3 sm:py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-semibold text-foreground transition-colors"
            title="Volver a CMS"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <ChefHat className="w-4 h-4" />
            </div>
            <div className="hidden min-[420px]:block">
              <span className="font-extrabold text-xs sm:text-sm tracking-wide text-foreground uppercase block leading-none">
                KDS Cocina
              </span>
              <span className="text-[10px] sm:text-[11px] text-accent font-medium truncate max-w-[120px] sm:max-w-none block mt-0.5">
                {station}
              </span>
            </div>
          </div>
        </div>

        {/* Centro: Indicador En Vivo (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success font-semibold text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="tracking-wider uppercase text-[10px]">
            Sistema en vivo
          </span>
        </div>

        {/* Derecha: Audio, Fullscreen y Reloj */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-muted border-border text-foreground"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
            title={soundEnabled ? "Audio Activo" : "Silenciado"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-accent shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 shrink-0" />
            )}
            <span className="hidden md:inline">
              {soundEnabled ? "Audio" : "Silenciado"}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-foreground transition-colors"
            title="Pantalla Completa"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted border border-border rounded-lg font-mono text-xs sm:text-sm font-bold text-foreground">
            <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{currentTime || "00:00:00"}</span>
          </div>
        </div>
      </header>

      {/* Área Principal */}
      <main className="flex-1 overflow-hidden p-2 sm:p-4">{children}</main>
    </div>
  );
}
