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

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
const RESERVED_SLUGS = new Set(["menu", "cart", "r"]);

function getPublicBaseUrl(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]"
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value) && !RESERVED_SLUGS.has(value);
}

export function PublicPageSettingsTab() {
  const {
    currentRestaurant,
    restaurantId,
    role,
    loading: restaurantLoading,
  } = useRestaurant();
  const [settings, setSettings] =
    useState<PublicRestaurantPageSettings | null>(null);
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
  const canonicalUrl = useMemo(() => {
    if (!settings || !baseUrl) return null;
    return new URL(`/${encodeURIComponent(settings.slug)}`, baseUrl).toString();
  }, [baseUrl, settings]);
  const permanentQrUrl = useMemo(() => {
    if (!settings || !baseUrl) return null;
    return new URL(`/r/${encodeURIComponent(settings.publicId)}`, baseUrl).toString();
  }, [baseUrl, settings]);

  useEffect(() => setBaseUrl(getPublicBaseUrl()), []);

  useEffect(() => {
    if (restaurantLoading) return;

    let active = true;
    setSettings(null);
    setSlugDraft("");
    setQrDataUrl("");
    setError(null);
    setMessage(null);

    if (!restaurantId) {
      setError("Selecciona un restaurante para ver su página pública.");
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

  useEffect(() => {
    let active = true;
    if (!permanentQrUrl) {
      setQrDataUrl("");
      return;
    }

    void QRCode.toDataURL(permanentQrUrl, {
      width: 360,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#171717", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (active) setError("No se pudo generar el código QR.");
      });

    return () => {
      active = false;
    };
  }, [permanentQrUrl]);

  async function handleSaveSlug() {
    if (!settings || !canManage || savingSlug) return;
    const slug = slugDraft.trim();

    if (!isValidSlug(slug)) {
      setError("Usa minúsculas, números y guiones; evita menu, cart y r.");
      return;
    }

    setSavingSlug(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await publicPageService.update({ slug });
      setSettings((current) => current ? { ...current, slug: updated.slug } : updated);
      setSlugDraft(updated.slug);
      setMessage("Slug actualizado.");
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : "No se pudo guardar el slug.",
      );
    } finally {
      setSavingSlug(false);
    }
  }

  async function handlePublicationChange() {
    if (!settings || !canManage || savingPublication) return;
    setSavingPublication(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await publicPageService.update({
        isPublished: !settings.isPublished,
      });
      setSettings((current) => current ? { ...current, isPublished: updated.isPublished } : updated);
      setMessage(updated.isPublished ? "Página publicada." : "Página despublicada.");
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
      setSettings((current) => current ? {
        ...current,
        wifiName: updated.wifiName,
        wifiPasswordConfigured: updated.wifiPasswordConfigured,
      } : updated);
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

  async function handleSaveSocials() {
    if (!settings || !canManage || savingSocials) return;
    const urls: Array<[string, string[]]> = [
      [instagramUrl, ["instagram.com", "www.instagram.com"]],
      [googleBusinessUrl, ["google.com", "www.google.com", "maps.google.com", "maps.app.goo.gl", "goo.gl"]],
    ];
    if (settings.socialFieldsAvailable) {
      urls.push([tiktokUrl, ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"]]);
      urls.push([whatsappUrl, ["wa.me"]]);
    }
    for (const [value, hosts] of urls) {
      if (!value.trim()) continue;
      try {
        const parsed = new URL(value.trim());
        if (parsed.protocol !== "https:" || !hosts.includes(parsed.hostname.toLowerCase()) || parsed.username || parsed.password || parsed.port) {
          throw new Error();
        }
      } catch {
        setError("Revisa las URLs: deben ser enlaces HTTPS válidos de su plataforma.");
        return;
      }
    }
    if (settings.socialFieldsAvailable && whatsappUrl.trim() && !/^https:\/\/wa\.me\/(?:\+?\d{5,15})(?:[/?#].*)?$/i.test(whatsappUrl.trim())) {
      setError("WhatsApp debe usar https://wa.me/ seguido del número.");
      return;
    }

    setSavingSocials(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await socialLinksService.update({
        instagramUrl: instagramUrl.trim() || null,
        googleBusinessUrl: googleBusinessUrl.trim() || null,
        ...(settings.socialFieldsAvailable ? {
          tiktokUrl: tiktokUrl.trim() || null,
          whatsappUrl: whatsappUrl.trim() || null,
        } : {}),
      });
      setSettings((current) => current ? {
        ...current,
        instagramUrl: updated.instagramUrl,
        googleBusinessUrl: updated.googleBusinessUrl,
        tiktokUrl: updated.tiktokUrl,
        whatsappUrl: updated.whatsappUrl,
        socialFieldsAvailable: updated.socialFieldsAvailable,
      } : updated);
      setInstagramUrl(updated.instagramUrl ?? "");
      setGoogleBusinessUrl(updated.googleBusinessUrl ?? "");
      setTiktokUrl(updated.tiktokUrl ?? "");
      setWhatsappUrl(updated.whatsappUrl ?? "");
      setMessage("Redes sociales y contacto guardados.");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "No se pudieron guardar los enlaces.");
    } finally {
      setSavingSocials(false);
    }
  }

  async function handleCopyUrl(url: string | null) {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setMessage("URL copiada.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("No se pudo copiar la URL desde este navegador.");
    }
  }

  async function handleDownloadSvg() {
    if (!permanentQrUrl || !settings) return;
    try {
      const svg = await QRCode.toString(permanentQrUrl, {
        type: "svg",
        width: 720,
        margin: 2,
        errorCorrectionLevel: "H",
      });
      const objectUrl = URL.createObjectURL(
        new Blob([svg], { type: "image/svg+xml" }),
      );
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${settings.slug}-food360-qr.svg`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("No se pudo descargar el QR en SVG.");
    }
  }

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
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 id="public-page-title" className="text-base font-bold text-foreground">
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
          <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
          {settings.isPublished ? "Publicada" : "Borrador"}
        </span>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-foreground">Dirección pública</h3>
            <label
              htmlFor="public-restaurant-slug"
              className="mt-4 block text-xs font-medium text-muted-foreground"
            >
              Slug del restaurante
            </label>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                <span className="shrink-0 border-r border-border px-3 py-2.5 text-xs text-muted-foreground">
                  /
                </span>
                <input
                  id="public-restaurant-slug"
                  value={slugDraft}
                  onChange={(event) => setSlugDraft(event.target.value.toLowerCase())}
                  disabled={!canManage || savingSlug}
                  maxLength={80}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none disabled:opacity-60"
                  aria-describedby="public-slug-help"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveSlug}
                disabled={!canManage || savingSlug || slugDraft === settings.slug}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingSlug ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar slug
              </button>
            </div>
            <p id="public-slug-help" className="mt-2 text-xs text-muted-foreground">
              La URL cambia con el slug; el QR permanente sigue funcionando aunque lo renombres.
            </p>

            <div className="mt-5">
              <p className="text-xs font-medium text-muted-foreground">URL pública</p>
              {canonicalUrl ? (
                <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                  <code className="min-w-0 flex-1 break-all rounded-lg bg-muted px-3 py-2.5 text-xs text-foreground">
                    {canonicalUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => void handleCopyUrl(canonicalUrl)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
                    aria-label="Copiar URL pública"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                  Slug: <code>{settings.slug}</code>. La dirección definitiva estará disponible cuando se configure el dominio público de Food360.
                </p>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Publicación</h3>
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
              {savingPublication && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {settings.isPublished ? "Despublicar" : "Publicar página"}
            </button>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-accent" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-foreground">Wi-Fi para visitantes</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              La información se muestra en la página pública cuando está publicada.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="public-wifi-name" className="block text-xs font-medium text-muted-foreground">
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
                <label htmlFor="public-wifi-password" className="block text-xs font-medium text-muted-foreground">
                  Nueva contraseña
                </label>
                <input
                  id="public-wifi-password"
                  type="password"
                  value={wifiPassword}
                  onChange={(event) => {
                    setWifiPassword(event.target.value);
                    if (event.target.value) setClearWifiPassword(false);
                  }}
                  disabled={!canManage || savingWifi || clearWifiPassword}
                  maxLength={63}
                  autoComplete="new-password"
                  placeholder={settings.wifiPasswordConfigured ? "Guardada; vacío conserva la actual" : "Sin contraseña"}
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
                    {clearWifiPassword ? "Conservar contraseña" : "Borrar contraseña"}
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
              {savingWifi ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Wi-Fi
            </button>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-foreground">Redes sociales y contacto</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Los enlaces configurados aparecerán en la página pública.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium text-muted-foreground" htmlFor="public-instagram">Instagram
                <input id="public-instagram" type="url" value={instagramUrl} onChange={(event) => setInstagramUrl(event.target.value)} disabled={!canManage || savingSocials} placeholder="https://instagram.com/tu-restaurante" className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
              </label>
              <label className="block text-xs font-medium text-muted-foreground" htmlFor="public-tiktok">TikTok
                <input id="public-tiktok" type="url" value={tiktokUrl} onChange={(event) => setTiktokUrl(event.target.value)} disabled={!canManage || savingSocials || !settings.socialFieldsAvailable} placeholder="https://tiktok.com/@tu-restaurante" className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
              </label>
              <label className="block text-xs font-medium text-muted-foreground" htmlFor="public-whatsapp">WhatsApp
                <input id="public-whatsapp" type="url" value={whatsappUrl} onChange={(event) => setWhatsappUrl(event.target.value)} disabled={!canManage || savingSocials || !settings.socialFieldsAvailable} placeholder="https://wa.me/584121234567" className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
              </label>
              <label className="block text-xs font-medium text-muted-foreground" htmlFor="public-google-business">Ubicación (Google Maps)
                <input id="public-google-business" type="url" value={googleBusinessUrl} onChange={(event) => setGoogleBusinessUrl(event.target.value)} disabled={!canManage || savingSocials} placeholder="https://maps.google.com/..." className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
              </label>
            </div>
            {!settings.socialFieldsAvailable && <p className="mt-3 text-xs text-muted-foreground">TikTok y WhatsApp se habilitarán al añadir manualmente `tiktok_url` y `whatsapp_url` a `restaurants`.</p>}
            <button type="button" onClick={() => void handleSaveSocials()} disabled={!canManage || savingSocials} className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {savingSocials ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar enlaces
            </button>
          </section>

          {!canManage && (
            <p className="text-xs text-muted-foreground">
              Tu rol puede consultar la página, pero no cambiar el slug ni su publicación.
            </p>
          )}
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          {message && <p className="text-sm text-success" role="status">{message}</p>}
        </div>

        <aside className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground">QR de la página</h3>
          </div>
          <div className="mx-auto mt-4 grid aspect-square w-full max-w-56 place-items-center rounded-lg border border-border bg-white p-3">
            {qrDataUrl ? (
              // The permanent QR URL remains valid after slug changes.
              <img src={qrDataUrl} alt={`Código QR permanente para ${permanentQrUrl}`} className="h-full w-full" />
            ) : baseUrl ? (
              <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Generando QR" />
            ) : (
              <span className="px-4 text-center text-xs text-muted-foreground">
                Dominio pendiente de configuración
              </span>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {!baseUrl
              ? "El enlace y el QR estarán disponibles cuando se configure el dominio público."
              : settings.isPublished
              ? "Escanea para abrir la página del restaurante."
              : "El enlace del QR estará disponible cuando publiques la página."}
          </p>
          {permanentQrUrl && (
            <div className="mt-3">
              <p className="text-[11px] font-medium text-muted-foreground">
                URL permanente del QR
              </p>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <code className="min-w-0 flex-1 break-all text-[10px] text-foreground">
                  {permanentQrUrl}
                </code>
                <button
                  type="button"
                  onClick={() => void handleCopyUrl(permanentQrUrl)}
                  className="shrink-0 rounded-md border border-border p-2 text-foreground hover:bg-muted"
                  aria-label="Copiar URL permanente del QR"
                  title="Copiar URL permanente del QR"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={settings.isPublished ? qrDataUrl || undefined : undefined}
              download={`${settings.slug}-food360-qr.png`}
              aria-disabled={!qrDataUrl || !settings.isPublished || !permanentQrUrl}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border px-2 text-xs font-semibold text-foreground hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" /> PNG
            </a>
            <button
              type="button"
              onClick={() => void handleDownloadSvg()}
              disabled={!permanentQrUrl || !settings.isPublished}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border px-2 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" /> SVG
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
