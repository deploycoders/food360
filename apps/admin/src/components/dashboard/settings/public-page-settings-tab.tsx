"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Globe,
  LoaderCircle,
  QrCode,
  Save,
  Trash2,
  Wifi,
} from "lucide-react";
import QRCode from "qrcode";

import { useRestaurant } from "@/context/RestaurantContext";
import { publicPageService } from "@/services/public-page.service";
import { wifiSettingsService } from "@/services/wifi-settings.service";
import { socialLinksService } from "@/services/social-links.service";
import type { PublicRestaurantPageSettings } from "@food360/types";

// El slug ahora representa el subdominio del restaurante.
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

const RESERVED_SLUGS = new Set([
  "www",
  "admin",
  "app",
  "api",
  "dashboard",
  "docs",
  "support",
  "status",
  "menu",
  "cart",
  "r",
  "mail",
  "static",
  "assets",
  "cdn",
  "auth",
  "login",
  "register",
  "onboarding",
]);

function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value) && !RESERVED_SLUGS.has(value);
}

/**
 * Obtiene el dominio raíz de la aplicación pública.
 *
 * Desarrollo:
 * http://localhost:3000
 *
 * Producción:
 * https://food360.app
 *
 * Importante: esta variable debe configurarse en Admin,
 * porque este componente se ejecuta dentro de esa aplicación.
 */
function getPublicBaseUrl(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);

    if (url.username || url.password) {
      return null;
    }

    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    const isLocalhost =
      hostname === "localhost" || hostname.endsWith(".localhost");

    const isLoopback =
      hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";

    if (isLocalhost || isLoopback) {
      if (process.env.NODE_ENV !== "development" || url.protocol !== "http:") {
        return null;
      }

      // Para desarrollo utilizamos localhost, no una IP,
      // porque necesitamos generar subdominios *.localhost.
      if (!isLocalhost) return null;
    } else if (url.protocol !== "https:") {
      // En producción exigimos HTTPS.
      return null;
    }

    // La variable representa exclusivamente el dominio raíz.
    if (url.pathname !== "/" && url.pathname !== "") {
      return null;
    }

    url.hostname = hostname;
    url.pathname = "/";
    url.search = "";
    url.hash = "";

    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Convierte el slug en un subdominio.
 *
 * http://localhost:3000
 * -> http://la-cocina-de-mary.localhost:3000
 *
 * https://food360.app
 * -> https://la-cocina-de-mary.food360.app
 */
function buildRestaurantSubdomainUrl(slug: string, baseUrl: string): string {
  const url = new URL(baseUrl);

  const rootHostname = url.hostname.toLowerCase().replace(/^www\./, "");

  url.hostname = `${slug}.${rootHostname}`;
  url.pathname = "/";
  url.search = "";
  url.hash = "";

  return url.origin;
}

export function PublicPageSettingsTab() {
  const {
    currentRestaurant,
    restaurantId,
    role,
    loading: restaurantLoading,
  } = useRestaurant();

  const [settings, setSettings] = useState<PublicRestaurantPageSettings | null>(
    null,
  );

  const [slugDraft, setSlugDraft] = useState("");

  const [wifiName, setWifiName] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [clearWifiPassword, setClearWifiPassword] = useState(false);

  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("");

  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState(false);
  const [savingPublication, setSavingPublication] = useState(false);
  const [savingWifi, setSavingWifi] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);

  const [copied, setCopied] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canManage = role === "owner" || role === "admin";

  /**
   * Dirección pública del restaurante.
   * Ya no utiliza /slug.
   */
  const canonicalUrl = useMemo(() => {
    if (!settings || !baseUrl) return null;

    try {
      return buildRestaurantSubdomainUrl(settings.slug, baseUrl);
    } catch {
      return null;
    }
  }, [baseUrl, settings]);

  const baseDomainLabel = useMemo(() => {
    if (!baseUrl) return null;

    try {
      return new URL(baseUrl).host.replace(/^www\./, "");
    } catch {
      return null;
    }
  }, [baseUrl]);

  const subdomainDraftUrl = useMemo(() => {
    if (!baseUrl || !slugDraft.trim()) return null;

    const normalizedSlug = slugDraft.trim().toLowerCase();

    if (!isValidSlug(normalizedSlug)) return null;

    try {
      return buildRestaurantSubdomainUrl(normalizedSlug, baseUrl);
    } catch {
      return null;
    }
  }, [baseUrl, slugDraft]);

  /**
   * Carga del dominio público.
   */
  useEffect(() => {
    setBaseUrl(getPublicBaseUrl());
  }, []);

  /**
   * Carga de configuración del restaurante.
   */
  useEffect(() => {
    if (restaurantLoading) return;

    let active = true;

    setSettings(null);
    setSlugDraft("");
    setQrDataUrl("");

    setError(null);
    setMessage(null);

    if (!restaurantId) {
      setError("Selecciona un restaurante para configurar su página pública.");

      setLoading(false);
      return;
    }

    setLoading(true);

    void publicPageService
      .get()
      .then((result) => {
        if (!active) return;

        setSettings(result);
        setSlugDraft(result.slug);

        setWifiName(result.wifiName);

        setInstagramUrl(result.instagramUrl ?? "");
        setTiktokUrl(result.tiktokUrl ?? "");
        setWhatsappUrl(result.whatsappUrl ?? "");
        setGoogleBusinessUrl(result.googleBusinessUrl ?? "");
      })
      .catch((reason: unknown) => {
        if (!active) return;

        setError(
          reason instanceof Error
            ? reason.message
            : "No se pudo cargar la página pública.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [restaurantId, restaurantLoading]);

  /**
   * Generación automática del QR.
   *
   * El QR apunta directamente al subdominio actual.
   */
  useEffect(() => {
    let active = true;

    if (!canonicalUrl) {
      setQrDataUrl("");
      return;
    }

    void QRCode.toDataURL(canonicalUrl, {
      width: 360,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#171717",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (active) {
          setError("No se pudo generar el código QR.");
        }
      });

    return () => {
      active = false;
    };
  }, [canonicalUrl]);

  /**
   * Guardar subdominio.
   *
   * El backend sigue guardando el valor en restaurants.slug.
   */
  async function handleSaveSlug() {
    if (!settings || !canManage || savingSlug) return;

    const slug = slugDraft.trim().toLowerCase();

    if (!isValidSlug(slug)) {
      setError(
        "El subdominio debe tener entre 1 y 80 caracteres, utilizar únicamente minúsculas, números y guiones, y no puede terminar ni comenzar con un guion. Ese nombre también podría estar reservado.",
      );
      return;
    }

    if (slug === settings.slug) {
      return;
    }

    setSavingSlug(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await publicPageService.update({
        slug,
      });

      setSettings((current) =>
        current
          ? {
              ...current,
              slug: updated.slug,
            }
          : updated,
      );

      setSlugDraft(updated.slug);

      setMessage(
        "Subdominio actualizado correctamente. La dirección pública y el QR se han actualizado.",
      );
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudo guardar el subdominio.",
      );
    } finally {
      setSavingSlug(false);
    }
  }

  /**
   * Publicar / despublicar página.
   */
  async function handlePublicationChange() {
    if (!settings || !canManage || savingPublication || !canonicalUrl) {
      return;
    }

    setSavingPublication(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await publicPageService.update({
        isPublished: !settings.isPublished,
      });

      setSettings((current) =>
        current
          ? {
              ...current,
              isPublished: updated.isPublished,
            }
          : updated,
      );

      setMessage(
        updated.isPublished
          ? "Página publicada correctamente. El subdominio ya está disponible para los visitantes."
          : "Página despublicada correctamente.",
      );
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudo actualizar la publicación.",
      );
    } finally {
      setSavingPublication(false);
    }
  }

  /**
   * Guardar configuración Wi-Fi.
   */
  async function handleSaveWifi() {
    if (!settings || !canManage || savingWifi) return;

    const normalizedName = wifiName.trim();

    if (new TextEncoder().encode(normalizedName).length > 32) {
      setError("El nombre de red no puede superar 32 bytes.");
      return;
    }

    if (wifiPassword && (wifiPassword.length < 8 || wifiPassword.length > 63)) {
      setError("La contraseña Wi-Fi debe tener entre 8 y 63 caracteres.");
      return;
    }

    setSavingWifi(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await wifiSettingsService.update({
        wifiName: normalizedName,
        ...(wifiPassword ? { wifiPassword } : {}),
        clearWifiPassword,
      });

      setSettings((current) =>
        current
          ? {
              ...current,
              wifiName: updated.wifiName,
              wifiPasswordConfigured: updated.wifiPasswordConfigured,
            }
          : updated,
      );

      setWifiName(updated.wifiName);
      setWifiPassword("");
      setClearWifiPassword(false);

      setMessage("Configuración Wi-Fi guardada.");
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudo guardar la configuración Wi-Fi.",
      );
    } finally {
      setSavingWifi(false);
    }
  }

  /**
   * Validación y guardado de redes sociales.
   */
  async function handleSaveSocials() {
    if (!settings || !canManage || savingSocials) return;

    const urls: Array<[string, string[]]> = [
      [instagramUrl, ["instagram.com", "www.instagram.com"]],
      [
        googleBusinessUrl,
        [
          "google.com",
          "www.google.com",
          "maps.google.com",
          "maps.app.goo.gl",
          "goo.gl",
        ],
      ],
    ];

    if (settings.socialFieldsAvailable) {
      urls.push([tiktokUrl, ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"]]);

      urls.push([whatsappUrl, ["wa.me"]]);
    }

    for (const [value, hosts] of urls) {
      if (!value.trim()) continue;

      try {
        const parsed = new URL(value.trim());

        if (
          parsed.protocol !== "https:" ||
          !hosts.includes(parsed.hostname.toLowerCase()) ||
          parsed.username ||
          parsed.password ||
          parsed.port
        ) {
          throw new Error();
        }
      } catch {
        setError(
          "Revisa las URLs: deben ser enlaces HTTPS válidos de su plataforma.",
        );
        return;
      }
    }

    if (
      settings.socialFieldsAvailable &&
      whatsappUrl.trim() &&
      !/^https:\/\/wa\.me\/(?:\+?\d{5,15})(?:[/?#].*)?$/i.test(
        whatsappUrl.trim(),
      )
    ) {
      setError("WhatsApp debe utilizar https://wa.me/ seguido del número.");
      return;
    }

    setSavingSocials(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await socialLinksService.update({
        instagramUrl: instagramUrl.trim() || null,
        googleBusinessUrl: googleBusinessUrl.trim() || null,

        ...(settings.socialFieldsAvailable
          ? {
              tiktokUrl: tiktokUrl.trim() || null,
              whatsappUrl: whatsappUrl.trim() || null,
            }
          : {}),
      });

      setSettings((current) =>
        current
          ? {
              ...current,
              instagramUrl: updated.instagramUrl,
              googleBusinessUrl: updated.googleBusinessUrl,
              tiktokUrl: updated.tiktokUrl,
              whatsappUrl: updated.whatsappUrl,
              socialFieldsAvailable: updated.socialFieldsAvailable,
            }
          : updated,
      );

      setInstagramUrl(updated.instagramUrl ?? "");
      setGoogleBusinessUrl(updated.googleBusinessUrl ?? "");
      setTiktokUrl(updated.tiktokUrl ?? "");
      setWhatsappUrl(updated.whatsappUrl ?? "");

      setMessage("Redes sociales y contacto guardados.");
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudieron guardar los enlaces.",
      );
    } finally {
      setSavingSocials(false);
    }
  }

  /**
   * Copiar dirección pública.
   */
  async function handleCopyUrl(url: string | null) {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);
      setMessage("Dirección copiada correctamente.");

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError("No se pudo copiar la dirección desde este navegador.");
    }
  }

  /**
   * Descargar QR en SVG.
   */
  async function handleDownloadSvg() {
    if (!canonicalUrl || !settings) return;

    try {
      const svg = await QRCode.toString(canonicalUrl, {
        type: "svg",
        width: 720,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#171717",
          light: "#ffffff",
        },
      });

      const objectUrl = URL.createObjectURL(
        new Blob([svg], {
          type: "image/svg+xml",
        }),
      );

      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = `${settings.slug}-food360-qr.svg`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch {
      setError("No se pudo descargar el QR en SVG.");
    }
  }

  /**
   * Estados iniciales.
   */
  if (loading || restaurantLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
        Cargando página pública...
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="rounded-xl border border-border bg-card p-5" role="alert">
        <p className="text-sm font-semibold text-foreground">
          No se pudo cargar la configuración pública
        </p>

        <p className="mt-1 text-sm text-muted-foreground">{error}</p>

        <p className="mt-2 text-xs text-muted-foreground">
          Comprueba la configuración del servicio o contacta al soporte.
        </p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <section className="space-y-5" aria-labelledby="public-page-title">
      {/* Encabezado */}
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" aria-hidden="true" />

            <h2
              id="public-page-title"
              className="text-base font-bold text-foreground"
            >
              Página pública y código QR
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {currentRestaurant?.name ?? "Restaurante seleccionado"}
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            settings.isPublished
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span
            className="h-2 w-2 rounded-full bg-current"
            aria-hidden="true"
          />

          {settings.isPublished ? "Publicada" : "Borrador"}
        </span>
      </header>

      {/* Contenido principal */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {/* Subdominio */}
          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Dirección pública
            </h3>

            <label
              htmlFor="public-restaurant-slug"
              className="mt-4 block text-xs font-medium text-muted-foreground"
            >
              Nombre del subdominio
            </label>

            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                <span className="shrink-0 border-r border-border px-3 py-2.5 text-xs text-muted-foreground">
                  {baseUrl ? new URL(baseUrl).protocol : "https:"}
                  //
                </span>

                <input
                  id="public-restaurant-slug"
                  value={slugDraft}
                  onChange={(event) =>
                    setSlugDraft(
                      event.target.value.toLowerCase().replace(/\s+/g, "-"),
                    )
                  }
                  disabled={!canManage || savingSlug}
                  maxLength={80}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm text-foreground outline-none disabled:opacity-60"
                  aria-describedby="public-slug-help"
                />

                <span className="shrink-0 border-l border-border px-3 py-2.5 text-xs text-muted-foreground">
                  {baseDomainLabel ? `.${baseDomainLabel}` : ".tu-dominio.com"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveSlug}
                disabled={
                  !canManage ||
                  savingSlug ||
                  slugDraft.trim().toLowerCase() === settings.slug
                }
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingSlug ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar subdominio
              </button>
            </div>

            <p
              id="public-slug-help"
              className="mt-2 text-xs text-muted-foreground"
            >
              Utiliza minúsculas, números y guiones. Este nombre identifica la
              dirección pública de tu restaurante.
            </p>

            {!baseUrl && (
              <p className="mt-2 text-xs text-warning">
                Configura NEXT_PUBLIC_PUBLIC_APP_URL en Admin para generar la
                dirección pública y el QR.
              </p>
            )}

            {baseUrl && subdomainDraftUrl && (
              <div className="mt-5">
                <p className="text-xs font-medium text-muted-foreground">
                  Vista previa de la dirección
                </p>

                <code className="mt-1.5 block break-all rounded-lg bg-muted px-3 py-2.5 text-xs text-foreground">
                  {subdomainDraftUrl}
                </code>
              </div>
            )}

            <div className="mt-5">
              <p className="text-xs font-medium text-muted-foreground">
                Dirección pública actual
              </p>

              {canonicalUrl ? (
                <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                  <code className="min-w-0 flex-1 break-all rounded-lg bg-muted px-3 py-2.5 text-xs text-foreground">
                    {canonicalUrl}
                  </code>

                  <button
                    type="button"
                    onClick={() => void handleCopyUrl(canonicalUrl)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
                    aria-label="Copiar dirección pública"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}

                    {copied ? "Copiada" : "Copiar"}
                  </button>

                  {settings.isPublished ? (
                    <a
                      href={canonicalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Vista previa
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="Publica la página para abrir la vista previa pública"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Vista previa
                    </button>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  El dominio público todavía no está configurado.
                </p>
              )}
            </div>
          </section>

          {/* Publicación */}
          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Publicación
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                {settings.isPublished
                  ? "La página está disponible para visitantes."
                  : "La página permanece privada mientras esté en borrador."}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.isPublished}
              disabled={!canManage || savingPublication || !canonicalUrl}
              onClick={handlePublicationChange}
              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                settings.isPublished
                  ? "border border-border text-foreground hover:bg-muted"
                  : "bg-accent text-accent-foreground hover:opacity-90"
              }`}
            >
              {savingPublication && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}

              {settings.isPublished ? "Despublicar" : "Publicar página"}
            </button>
          </section>

          {/* Wi-Fi */}
          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-accent" aria-hidden="true" />

              <h3 className="text-sm font-semibold text-foreground">
                Wi-Fi para visitantes
              </h3>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              La información se muestra en la página pública cuando está
              publicada.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="public-wifi-name"
                  className="block text-xs font-medium text-muted-foreground"
                >
                  Nombre de red (SSID)
                </label>

                <input
                  id="public-wifi-name"
                  value={wifiName}
                  onChange={(event) => setWifiName(event.target.value)}
                  disabled={!canManage || savingWifi}
                  maxLength={32}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="public-wifi-password"
                  className="block text-xs font-medium text-muted-foreground"
                >
                  Nueva contraseña
                </label>

                <input
                  id="public-wifi-password"
                  type="password"
                  value={wifiPassword}
                  onChange={(event) => {
                    setWifiPassword(event.target.value);

                    if (event.target.value) {
                      setClearWifiPassword(false);
                    }
                  }}
                  disabled={!canManage || savingWifi || clearWifiPassword}
                  maxLength={63}
                  autoComplete="new-password"
                  placeholder={
                    settings.wifiPasswordConfigured
                      ? "Guardada; vacío conserva la actual"
                      : "Sin contraseña"
                  }
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />

                {settings.wifiPasswordConfigured && (
                  <button
                    type="button"
                    disabled={!canManage || savingWifi}
                    onClick={() => {
                      setClearWifiPassword((clear) => !clear);
                      setWifiPassword("");
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />

                    {clearWifiPassword
                      ? "Conservar contraseña"
                      : "Borrar contraseña"}
                  </button>
                )}
              </div>
            </div>

            {wifiName.trim() === "" && settings.wifiPasswordConfigured && (
              <p className="mt-3 text-xs text-muted-foreground">
                Al borrar el SSID también se elimina la contraseña asociada.
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleSaveWifi()}
              disabled={!canManage || savingWifi}
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingWifi ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar Wi-Fi
            </button>
          </section>

          {/* Redes sociales */}
          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent" aria-hidden="true" />

              <h3 className="text-sm font-semibold text-foreground">
                Redes sociales y contacto
              </h3>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Los enlaces configurados aparecerán en la página pública.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label
                className="block text-xs font-medium text-muted-foreground"
                htmlFor="public-instagram"
              >
                Instagram
                <input
                  id="public-instagram"
                  type="url"
                  value={instagramUrl}
                  onChange={(event) => setInstagramUrl(event.target.value)}
                  disabled={!canManage || savingSocials}
                  placeholder="https://instagram.com/tu-restaurante"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />
              </label>

              <label
                className="block text-xs font-medium text-muted-foreground"
                htmlFor="public-tiktok"
              >
                TikTok
                <input
                  id="public-tiktok"
                  type="url"
                  value={tiktokUrl}
                  onChange={(event) => setTiktokUrl(event.target.value)}
                  disabled={
                    !canManage ||
                    savingSocials ||
                    !settings.socialFieldsAvailable
                  }
                  placeholder="https://tiktok.com/@tu-restaurante"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />
              </label>

              <label
                className="block text-xs font-medium text-muted-foreground"
                htmlFor="public-whatsapp"
              >
                WhatsApp
                <input
                  id="public-whatsapp"
                  type="url"
                  value={whatsappUrl}
                  onChange={(event) => setWhatsappUrl(event.target.value)}
                  disabled={
                    !canManage ||
                    savingSocials ||
                    !settings.socialFieldsAvailable
                  }
                  placeholder="https://wa.me/584121234567"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />
              </label>

              <label
                className="block text-xs font-medium text-muted-foreground"
                htmlFor="public-google-business"
              >
                Ubicación (Google Maps)
                <input
                  id="public-google-business"
                  type="url"
                  value={googleBusinessUrl}
                  onChange={(event) => setGoogleBusinessUrl(event.target.value)}
                  disabled={!canManage || savingSocials}
                  placeholder="https://maps.google.com/..."
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />
              </label>
            </div>

            {!settings.socialFieldsAvailable && (
              <p className="mt-3 text-xs text-muted-foreground">
                TikTok y WhatsApp se habilitarán al añadir manualmente
                tiktok_url y whatsapp_url a restaurants.
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleSaveSocials()}
              disabled={!canManage || savingSocials}
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingSocials ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar enlaces
            </button>
          </section>

          {!canManage && (
            <p className="text-xs text-muted-foreground">
              Tu rol puede consultar la página, pero no cambiar el subdominio ni
              su publicación.
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-success" role="status">
              {message}
            </p>
          )}
        </div>

        {/* QR */}
        <aside className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-accent" aria-hidden="true" />

            <h3 className="text-sm font-semibold text-foreground">
              QR del restaurante
            </h3>
          </div>

          <div className="mx-auto mt-4 grid aspect-square w-full max-w-56 place-items-center rounded-lg border border-border bg-white p-3">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Código QR de ${canonicalUrl}`}
                className="h-full w-full"
              />
            ) : baseUrl ? (
              <LoaderCircle
                className="h-6 w-6 animate-spin text-muted-foreground"
                aria-label="Generando QR"
              />
            ) : (
              <span className="px-4 text-center text-xs text-muted-foreground">
                Configura el dominio público para generar el código QR.
              </span>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            {canonicalUrl
              ? settings.isPublished
                ? "Escanea para visitar el subdominio del restaurante."
                : "El QR estará disponible para visitantes cuando publiques la página."
              : "El QR estará disponible cuando se configure el dominio público."}
          </p>

          {canonicalUrl && (
            <div className="mt-3">
              <p className="text-[11px] font-medium text-muted-foreground">
                Dirección del QR
              </p>

              <div className="mt-1 flex min-w-0 items-center gap-2">
                <code className="min-w-0 flex-1 break-all text-[10px] text-foreground">
                  {canonicalUrl}
                </code>

                <button
                  type="button"
                  onClick={() => void handleCopyUrl(canonicalUrl)}
                  className="shrink-0 rounded-md border border-border p-2 text-foreground hover:bg-muted"
                  aria-label="Copiar dirección del QR"
                  title="Copiar dirección del QR"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {settings.isPublished && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={qrDataUrl || undefined}
                download={`${settings.slug}-food360-qr.png`}
                aria-disabled={!qrDataUrl || !canonicalUrl}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border px-2 text-xs font-semibold text-foreground hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                PNG
              </a>

              <button
                type="button"
                onClick={() => void handleDownloadSvg()}
                disabled={!canonicalUrl}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border px-2 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                SVG
              </button>
            </div>
          )}

          {settings.isPublished && canonicalUrl && (
            <p className="mt-3 text-center text-[10px] text-muted-foreground">
              Al cambiar el subdominio tendrás que descargar el nuevo QR si ya
              imprimiste el anterior.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
