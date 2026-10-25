"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

type PageStatus = "checking" | "ready" | "invalid" | "completed";
const RECOVERY_SESSION_MAX_AGE = 15 * 60 * 1000;

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { passwordRecovery } = useAuth();

  const [status, setStatus] = useState<PageStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const callbackUrl = new URL(window.location.href);
    const callbackParams = new URLSearchParams(callbackUrl.hash.slice(1));
    const callbackError =
      callbackUrl.searchParams.get("error_description") ??
      callbackUrl.searchParams.get("error") ??
      callbackUrl.searchParams.get("error_code") ??
      callbackParams.get("error_description") ??
      callbackParams.get("error") ??
      callbackParams.get("error_code");

    if (callbackError) {
      setStatus("invalid");
      return;
    }

    // Supabase's PKCE callback is parsed and exchanged by createBrowserClient.
    // AuthProvider keeps the resulting PASSWORD_RECOVERY event in memory.
    const timeout = window.setTimeout(() => {
      if (!passwordRecovery) {
        setStatus((current) =>
          current === "completed" ? current : "invalid",
        );
      }
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [passwordRecovery]);

  useEffect(() => {
    let active = true;

    if (!passwordRecovery) return;

    const callbackUrl = new URL(window.location.href);
    const callbackParams = new URLSearchParams(callbackUrl.hash.slice(1));
    if (
      callbackUrl.searchParams.has("error") ||
      callbackUrl.searchParams.has("error_description") ||
      callbackUrl.searchParams.has("error_code") ||
      callbackParams.has("error") ||
      callbackParams.has("error_description") ||
      callbackParams.has("error_code")
    ) {
      setStatus("invalid");
      return;
    }

    const recoveryAge = Date.now() - passwordRecovery.occurredAt;
    if (recoveryAge < 0 || recoveryAge > RECOVERY_SESSION_MAX_AGE) {
      setStatus("invalid");
      return;
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) console.error("Error verificando sesión de recuperación:", error);
      if (data.session?.user.id === passwordRecovery.userId && !error) {
        setStatus("ready");
      } else {
        setStatus("invalid");
      }
    }).catch((error: unknown) => {
      if (!active) return;
      console.error("Error leyendo la sesión de recuperación:", error);
      setStatus("invalid");
    });

    return () => {
      active = false;
    };
  }, [passwordRecovery, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);

    if (password.length < 10) {
      setErrorMessage("La contraseña debe tener al menos 10 caracteres.");
      return;
    }

    if (password.length > 128) {
      setErrorMessage("La contraseña no puede superar 128 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (status !== "ready") {
      setErrorMessage(
        "Tu enlace no es válido o ha caducado. Solicita uno nuevo.",
      );
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      const recoveryAge = passwordRecovery
        ? Date.now() - passwordRecovery.occurredAt
        : Number.POSITIVE_INFINITY;
      const hasValidRecoverySession =
        !sessionError &&
        !!sessionData.session &&
        passwordRecovery?.userId === sessionData.session.user.id &&
        recoveryAge >= 0 &&
        recoveryAge <= RECOVERY_SESSION_MAX_AGE;

      if (!hasValidRecoverySession) {
        setStatus("invalid");
        setErrorMessage("Tu sesión de recuperación expiró. Solicita un enlace nuevo.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Error actualizando contraseña:", error);

        setErrorMessage(
          "No se pudo actualizar la contraseña. Es posible que el enlace haya caducado; solicita uno nuevo e inténtalo otra vez.",
        );

        return;
      }

      setPassword("");
      setConfirmPassword("");
      setStatus("completed");

      // Tras recuperar la cuenta, exigimos un nuevo inicio de sesión.
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      if (signOutError) {
        console.warn(
          "La contraseña cambió, pero no se pudo cerrar la sesión local:",
          signOutError,
        );
      }
    } catch (error) {
      console.error("Error inesperado al cambiar contraseña:", error);

      setErrorMessage("Ocurrió un error de conexión. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 transition-colors sm:p-6">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/[0.04]">
          <div className="px-6 pb-2 pt-8 text-center sm:px-9 sm:pt-10">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
              <UtensilsCrossed className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Food<span className="text-accent">360</span> Admin
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Seguridad de tu cuenta
            </p>
          </div>

          <div className="px-6 pb-8 pt-6 sm:px-9 sm:pb-9">
            {status === "checking" ? (
              <div className="py-8 text-center">
                <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-accent" />

                <p className="mt-4 text-sm font-semibold text-foreground">
                  Verificando enlace
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Estamos comprobando la sesión de recuperación.
                </p>
              </div>
            ) : status === "invalid" ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Enlace no válido o caducado
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Solicita un nuevo correo de recuperación e intenta abrir su
                    enlace desde el mismo navegador.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Solicitar nuevo enlace
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="inline-flex h-9 items-center justify-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Volver al login
                </button>
              </div>
            ) : status === "completed" ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Contraseña actualizada
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Tu contraseña se ha cambiado correctamente. Inicia sesión
                    con tus nuevas credenciales para continuar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.replace("/login")}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Ir al inicio de sesión
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-foreground">
                    Crea una nueva contraseña
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Elige una contraseña segura que no utilices en otros
                    servicios.
                  </p>
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs leading-5 text-destructive"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="new-password"
                      className="mb-2 block text-xs font-semibold text-foreground"
                    >
                      Nueva contraseña
                    </label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={10}
                        maxLength={128}
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Mínimo 10 caracteres"
                        disabled={isSubmitting}
                        className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      Utiliza al menos 10 caracteres.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-xs font-semibold text-foreground"
                    >
                      Confirmar contraseña
                    </label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={10}
                        maxLength={128}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Repite la contraseña"
                        disabled={isSubmitting}
                        className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar confirmación"
                            : "Mostrar confirmación"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      password.length < 10 ||
                      confirmPassword.length < 10
                    }
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-foreground shadow-sm shadow-accent/20 transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Actualizando contraseña...
                      </>
                    ) : (
                      <>
                        Guardar nueva contraseña
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <p className="text-[11px] leading-5 text-muted-foreground">
                    No compartas tu contraseña. Food360 nunca necesita que se la
                    envíes a un administrador.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Food360 Admin · Acceso seguro al restaurante
        </p>
      </div>
    </main>
  );
}
