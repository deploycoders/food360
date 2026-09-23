"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  UtensilsCrossed,
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("Error enviando recuperación:", error);
      setErrorMessage(
        "No se pudo enviar el correo de recuperación. Inténtalo nuevamente.",
      );
      setIsLoading(false);
      return;
    }

    setSent(true);
    setIsLoading(false);
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
            Recupera el acceso a tu cuenta
          </p>
        </div>

        {sent ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-muted/40 p-5 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <h2 className="text-sm font-semibold text-foreground mb-2">
                Revisa tu correo
              </h2>

              <p className="text-xs leading-5 text-muted-foreground">
                Si existe una cuenta asociada a ese correo, recibirás un enlace
                para restablecer tu contraseña.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-2.5 px-4 cursor-pointer text-sm font-semibold rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-sm font-semibold text-foreground mb-1">
                ¿Olvidaste tu contraseña?
              </h2>

              <p className="text-xs leading-5 text-muted-foreground">
                Introduce el correo electrónico asociado a tu cuenta y te
                enviaremos un enlace para crear una nueva contraseña.
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
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@restaurante.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 cursor-pointer text-sm font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  "Enviando..."
                ) : (
                  <>
                    Enviar enlace de recuperación
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full text-xs cursor-pointer text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver al inicio de sesión
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
