"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  UtensilsCrossed,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  ChefHat,
  AlertCircle,
} from "lucide-react";

// Instancia única fuera del ciclo de render de React
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      console.error("Error Auth Supabase:", error);
      setIsLoading(false);
      // Muestra el mensaje exacto que devuelve Supabase
      setErrorMessage(error.message);
      return;
    }

    if (data?.user) {
      const { data: membership, error: membershipError } = await supabase
        .from("restaurant_members")
        .select("role, is_active")
        .eq("user_id", data.user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError || !membership) {
        console.error(
          "No se encontró membresía del restaurante:",
          membershipError,
        );

        setIsLoading(false);
        setErrorMessage("Tu usuario no está asociado a ningún restaurante.");

        return;
      }

      if (!membership.is_active) {
        await supabase.auth.signOut();

        setIsLoading(false);
        setErrorMessage(
          "Tu cuenta está desactivada. Contacta al administrador del restaurante.",
        );

        return;
      }

      const rawRedirectTo = getCookie("redirectTo");

      deleteCookie("redirectTo");

      const redirectTo = rawRedirectTo
        ? decodeURIComponent(rawRedirectTo)
        : null;

      let targetPath = "/orders";

      if (membership.role === "owner" || membership.role === "admin") {
        targetPath = "/";
      } else if (membership.role === "chef") {
        targetPath = "/kds";
      }

      if (redirectTo) {
        targetPath = redirectTo;
      }

      window.location.href = targetPath;
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("Password123!");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 transition-colors duration-200">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-2xl transition-colors duration-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/25 mb-4">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
            Food<span className="text-accent">360</span> Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Plataforma de Control CMS y Sistema KDS
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@restaurante.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-xs text-accent hover:underline"
              >
                ¿Olvidaste tu clave?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-accent rounded border-border"
              />
              Recordar este dispositivo
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 text-sm font-semibold ${
              isLoading ? "cursor-auto" : "cursor-pointer"
            } rounded-xl bg-accent text-accent-foreground hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? "Validando sesión..." : "Ingresar al Panel"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-7 pt-5 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Acceso rápido de demostración:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@food360.com")}
              className="px-3 py-2 text-xs font-medium cursor-pointer rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-accent" /> Admin / CMS
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("cocina@food360.com")}
              className="px-3 py-2 text-xs font-medium cursor-pointer rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <ChefHat className="w-3.5 h-3.5 text-accent" /> Chef / KDS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
