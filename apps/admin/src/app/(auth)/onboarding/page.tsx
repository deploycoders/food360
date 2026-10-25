"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@food360/theme";
import {
  ArrowRight,
  Building2,
  LoaderCircle,
  LogOut,
  Mail,
  Moon,
  Phone,
  Store,
  Sun,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { createMyRestaurant } from "@/services/onboarding.service";
import { useRestaurant } from "@/context/RestaurantContext";
import { useAuth } from "@/context/AuthContext";

export default function OnboardingPage() {
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);
  const { user, loading: authLoading } = useAuth();
  const { restaurantId, loading: restaurantLoading } = useRestaurant();
  const { resolvedTheme, setTheme } = useTheme();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [inviteToken, setInviteToken] = useState("");

  const [profileReady, setProfileReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evita diferencias de hidratación al mostrar el tema.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Obtiene los datos directamente de la sesión autenticada.
  // No depende de /api/v1/profile, que exige una membresía activa.
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setProfileReady(true);
      router.replace("/login");
      return;
    }

    const metadata = user.user_metadata ?? {};

    const metadataFullName =
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : "";

    const metadataPhone =
      typeof metadata.phone === "string" ? metadata.phone : "";

    setFullName((current) => current || metadataFullName);
    setPhone((current) => current || metadataPhone);
    setEmail(user.email ?? "");
    setProfileReady(true);
  }, [user, authLoading, router]);

  // Los usuarios con restaurante activo deben ir al dashboard.
  useEffect(() => {
    if (!restaurantLoading && restaurantId) {
      router.replace("/");
    }
  }, [restaurantId, restaurantLoading, router]);

  function handleToggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      try {
        window.localStorage.removeItem("food360.currentRestaurantId");
      } catch {
        // No impedimos cerrar sesión si el almacenamiento no está disponible.
      }

      window.location.replace("/login");
    } catch (err) {
      console.error("Error cerrando sesión:", err);

      toast.error("No se pudo cerrar la sesión. Inténtalo de nuevo.");
      setSigningOut(false);
    }
  }

  function handleInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = inviteToken.trim();

    if (!token) {
      toast.error("Introduce el token de tu invitación.");
      return;
    }

    router.push(`/invite/${encodeURIComponent(token)}`);
  }

  async function handleCreateRestaurant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (creating || authLoading || restaurantLoading || restaurantId || !user) {
      return;
    }

    const normalizedName = fullName.trim();
    const normalizedPhone = phone.trim();
    const normalizedRestaurantName = restaurantName.trim();

    if (!normalizedName) {
      toast.error("Introduce tu nombre completo.");
      return;
    }

    if (!normalizedRestaurantName) {
      toast.error("Introduce el nombre de tu restaurante.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const result = await createMyRestaurant({
        fullName: normalizedName,
        phone: normalizedPhone || null,
        restaurantName: normalizedRestaurantName,
      });

      try {
        window.localStorage.setItem(
          "food360.currentRestaurantId",
          result.restaurant.id,
        );
      } catch {
        // El contexto podrá volver a consultar las membresías al recargar.
      }

      toast.success("Restaurante creado correctamente.");

      // Actualiza la sesión de la aplicación y el contexto de restaurante.
      window.location.assign("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo crear tu restaurante.";

      setError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  if (authLoading || restaurantLoading || !profileReady || restaurantId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Preparando tu espacio de trabajo...
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full items-center justify-center py-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Acciones de cuenta y apariencia */}
        <div className="flex absolute right-4 items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleToggleTheme}
            disabled={!mounted}
            aria-label={
              mounted && resolvedTheme === "dark"
                ? "Cambiar a modo claro"
                : "Cambiar a modo oscuro"
            }
            title={
              mounted && resolvedTheme === "dark"
                ? "Cambiar a modo claro"
                : "Cambiar a modo oscuro"
            }
            className="inline-flex h-10 w-10 items-center cursor-pointer justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className="inline-flex h-10 items-center cursor-pointer justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingOut ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}

            {signingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>

        {/* Introducción */}
        <header className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <Store className="h-7 w-7 text-accent" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Bienvenido a Food360
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Configuremos tu espacio
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Completa tus datos personales y crea el restaurante desde el que
            gestionarás tu negocio.
          </p>
        </header>

        {/* Formulario de creación */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Datos iniciales
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tu cuenta personal y tu restaurante.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(event) => void handleCreateRestaurant(event)}
            className="space-y-5 p-5 sm:p-7"
          >
            {/* Nombre personal */}
            <div>
              <label
                htmlFor="onboarding-full-name"
                className="mb-2 block text-xs font-semibold text-foreground"
              >
                Nombre completo
              </label>

              <div className="relative">
                <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="onboarding-full-name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Tu nombre completo"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                />
              </div>
            </div>

            {/* Correo vinculado a la cuenta */}
            <div>
              <label
                htmlFor="onboarding-email"
                className="mb-2 block text-xs font-semibold text-foreground"
              >
                Correo electrónico de tu cuenta
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="onboarding-email"
                  type="email"
                  readOnly
                  value={email}
                  placeholder="No se encontró el correo de la sesión"
                  autoComplete="email"
                  aria-describedby="onboarding-email-help"
                  className="h-11 w-full rounded-xl border border-input bg-muted/40 pl-10 pr-3 text-sm text-foreground outline-none read-only:cursor-default"
                />
              </div>

              <p
                id="onboarding-email-help"
                className="mt-2 text-[11px] leading-5 text-muted-foreground"
              >
                Este es el correo con el que iniciaste sesión.
              </p>
            </div>

            {/* Teléfono */}
            <div>
              <label
                htmlFor="onboarding-phone"
                className="mb-2 block text-xs font-semibold text-foreground"
              >
                Teléfono personal{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </label>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="onboarding-phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Tu número de teléfono"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                />
              </div>
            </div>

            {/* Restaurante */}
            <div className="border-t border-border pt-5">
              <label
                htmlFor="onboarding-restaurant-name"
                className="mb-2 block text-xs font-semibold text-foreground"
              >
                Nombre del restaurante
              </label>

              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="onboarding-restaurant-name"
                  required
                  maxLength={120}
                  autoComplete="organization"
                  value={restaurantName}
                  onChange={(event) => setRestaurantName(event.target.value)}
                  placeholder="Ej. La Cocina de Ana"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                />
              </div>

              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                Podrás completar la dirección y el resto de la configuración
                comercial más adelante.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs leading-5 text-destructive"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                creating || !fullName.trim() || !restaurantName.trim() || !email
              }
              className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}

              {creating
                ? "Creando tu restaurante..."
                : "Crear restaurante y continuar"}
            </button>
          </form>
        </section>

        {/* Acceso alternativo para personas invitadas */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground">
            ¿Te invitaron a un restaurante?
          </h2>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Si vas a trabajar en un restaurante que ya existe, acepta su
            invitación en lugar de crear uno nuevo.
          </p>

          <form
            onSubmit={handleInvitation}
            className="mt-4 flex flex-col gap-2 sm:flex-row"
          >
            <input
              value={inviteToken}
              onChange={(event) => setInviteToken(event.target.value)}
              placeholder="Token de invitación"
              aria-label="Token de invitación"
              className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />

            <button
              type="submit"
              disabled={!inviteToken.trim()}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-4 text-xs font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Usar invitación
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
