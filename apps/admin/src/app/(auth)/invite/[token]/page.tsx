"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UtensilsCrossed,
} from "lucide-react";
import { acceptTeamInvitation, validateTeamInvitation } from "@/services/team.service";
import type { ValidateTeamInvitationResult } from "@/types/team";
import { createClient } from "@/lib/supabase/client";

type InviteStatus = "checking" | "ready" | "invalid" | "accepted";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<InviteStatus>("checking");
  const [invitation, setInvitation] = useState<ValidateTeamInvitationResult | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!token || token.length > 256) {
      setStatus("invalid");
      return;
    }

    void validateTeamInvitation(token)
      .then((result) => {
        if (!active) return;
        setInvitation(result);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Error validando invitación:", error);
        setErrorMessage(error instanceof Error ? error.message : "El enlace no es válido o ha caducado.");
        setStatus("invalid");
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setLoginMessage(null);

    if (password.length < 10 || password.length > 128) {
      setErrorMessage("La contraseña debe tener entre 10 y 128 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }
    if (!invitation || status !== "ready" || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const accepted = await acceptTeamInvitation({ token, password });
      setStatus("accepted");
      setPassword("");
      setConfirmPassword("");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: accepted.email,
        password,
      });

      if (signInError) {
        console.error("Invitación aceptada, pero no se pudo iniciar sesión:", signInError);
        setLoginMessage("La invitación fue aceptada. Inicia sesión con tu correo y la contraseña que acabas de crear.");
        return;
      }

      const destination =
        accepted.role === "admin" ? "/" :
        accepted.role === "chef" ? "/kds" : "/orders";
      window.location.assign(destination);
    } catch (error) {
      console.error("Error aceptando invitación:", error);
      const message = error instanceof Error ? error.message : "No se pudo aceptar la invitación.";
      if (message.toLowerCase().includes("ya existe una cuenta")) {
        setErrorMessage("Este correo ya tiene una cuenta. Inicia sesión para continuar y pide al administrador que te añada al restaurante.");
      } else {
        setErrorMessage(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 transition-colors sm:p-6">
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/[0.04]">
        <header className="px-6 pb-2 pt-8 text-center sm:px-9 sm:pt-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Food<span className="text-accent">360</span> Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Invitación al equipo</p>
        </header>

        <div className="px-6 pb-8 pt-6 sm:px-9 sm:pb-9" aria-live="polite">
          {status === "checking" ? (
            <div className="py-8 text-center">
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-accent" />
              <p className="mt-4 text-sm font-semibold text-foreground">Verificando invitación...</p>
            </div>
          ) : status === "invalid" ? (
            <div className="space-y-5 text-center">
              <AlertCircle className="mx-auto h-9 w-9 text-destructive" />
              <div>
                <h2 className="text-base font-semibold text-foreground">Enlace no válido o caducado</h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {errorMessage || "Solicita al administrador del restaurante que genere un enlace nuevo."}
                </p>
              </div>
              <Link href="/login" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90">
                Ir al inicio de sesión <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : status === "accepted" ? (
            <div className="space-y-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h2 className="text-base font-semibold text-foreground">Invitación aceptada</h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {loginMessage || "Tu cuenta está lista. Inicia sesión para continuar."}
                </p>
              </div>
              <Link href="/login" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90">
                Ir al inicio de sesión <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-base font-semibold text-foreground">Completa tu acceso</h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {invitation?.name ? `${invitation.name}, crea una contraseña para unirte al equipo.` : "Crea una contraseña para unirte al equipo."}
                </p>
                <p className="mt-2 text-xs font-medium text-foreground">{invitation?.email}</p>
              </div>

              {errorMessage && (
                <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs leading-5 text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="invite-password" className="mb-2 block text-xs font-semibold text-foreground">Contraseña</label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input id="invite-password" type={showPassword ? "text" : "password"} required minLength={10} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isSubmitting} placeholder="Mínimo 10 caracteres" className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="invite-confirm-password" className="mb-2 block text-xs font-semibold text-foreground">Confirmar contraseña</label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input id="invite-confirm-password" type={showConfirmPassword ? "text" : "password"} required minLength={10} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={isSubmitting} placeholder="Repite la contraseña" className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50" />
                    <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting || status !== "ready" || password.length < 10 || password.length > 128 || confirmPassword.length < 10} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-foreground shadow-sm shadow-accent/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {isSubmitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />Aceptando invitación...</> : <>Crear cuenta y aceptar <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
