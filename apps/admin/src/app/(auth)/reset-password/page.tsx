"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  UtensilsCrossed,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("Error actualizando contraseña:", error);
        setErrorMessage(
          "No se pudo actualizar la contraseña. El enlace puede haber expirado.",
        );
        return;
      }

      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
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
            Establece una nueva contraseña
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-muted/40 p-5 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <h2 className="text-sm font-semibold text-foreground mb-2">
                Contraseña actualizada
              </h2>

              <p className="text-xs leading-5 text-muted-foreground">
                Tu contraseña se actualizó correctamente. Ya puedes iniciar
                sesión con tu nueva contraseña.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              Ir al inicio de sesión
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Nueva contraseña
                </label>

                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-[11px] text-muted-foreground">
                  Mínimo 8 caracteres.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  "Actualizando..."
                ) : (
                  <>
                    Cambiar contraseña
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
