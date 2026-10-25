"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Link2,
  LoaderCircle,
  Mail,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  TEAM_ROLE_LABELS,
  type TeamInvitation,
  type TeamInvitationStatus,
  type RenewTeamInvitationResult,
} from "@/types/team";

import {
  getTeamInvitations,
  renewTeamInvitationLink,
  revokeTeamInvitation,
} from "@/services/team.service";
import {
  confirmRenewTeamInvitationLink,
  confirmRevokeTeamInvitation,
  showTimedToast,
} from "@/app/lib/swal";

// Cambia este alias por la ruta REAL de tu archivo de alertas
// si no se encuentra en src/lib/alerts.

interface TeamInvitationsProps {
  canManageInvitations: boolean;
  refreshKey: number;
}

const STATUS_LABELS: Record<TeamInvitationStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  revoked: "Revocada",
  expired: "Caducada",
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha desconocida";
  }

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function isExpired(invitation: TeamInvitation): boolean {
  return (
    invitation.status === "expired" ||
    (invitation.status === "pending" &&
      new Date(invitation.expires_at).getTime() <= Date.now())
  );
}

function getStatusClasses(status: TeamInvitationStatus): string {
  switch (status) {
    case "pending":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";

    case "accepted":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

    case "revoked":
      return "border-destructive/20 bg-destructive/5 text-destructive";

    case "expired":
      return "border-border bg-muted text-muted-foreground";
  }
}

export function TeamInvitations({
  canManageInvitations,
  refreshKey,
}: TeamInvitationsProps) {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [localRefreshVersion, setLocalRefreshVersion] = useState(0);

  const [generatedLinks, setGeneratedLinks] = useState<
    Record<string, RenewTeamInvitationResult>
  >({});

  useEffect(() => {
    let cancelled = false;

    async function loadInvitations() {
      setLoading(true);
      setError(null);

      try {
        const data = await getTeamInvitations();

        if (cancelled) return;

        setInvitations(data);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las invitaciones.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInvitations();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, localRefreshVersion]);

  async function handleGenerateLink(invitation: TeamInvitation) {
    if (busyId || !canManageInvitations) return;

    // Renovar el enlace invalida el anterior. Pedimos confirmación.
    const confirmed = await confirmRenewTeamInvitationLink(invitation.email);

    if (!confirmed) return;

    setBusyId(invitation.id);

    try {
      const result = await renewTeamInvitationLink(invitation.id);

      setGeneratedLinks((previous) => ({
        ...previous,
        [invitation.id]: result,
      }));

      setInvitations((previous) =>
        previous.map((item) =>
          item.id === invitation.id
            ? {
                ...item,
                status: "pending",
                expires_at: result.expiresAt,
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      );

      try {
        await navigator.clipboard.writeText(result.inviteUrl);

        showTimedToast(
          "Enlace generado y copiado",
          "success",
          `La invitación de ${invitation.email} ya está lista para compartir.`,
        );
      } catch {
        showTimedToast(
          "Enlace generado",
          "success",
          "El enlace está disponible abajo. Cópialo para compartirlo.",
        );
      }
    } catch (err) {
      showTimedToast(
        "No se pudo generar el enlace",
        "error",
        err instanceof Error
          ? err.message
          : "Ocurrió un error al renovar la invitación.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleCopyLink(invitationId: string) {
    const link = generatedLinks[invitationId]?.inviteUrl;

    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);

      showTimedToast("Enlace copiado", "success");
    } catch {
      showTimedToast(
        "No se pudo copiar el enlace",
        "warning",
        "Selecciona el enlace y cópialo manualmente.",
      );
    }
  }

  async function handleRevoke(invitation: TeamInvitation) {
    if (busyId || !canManageInvitations) return;

    setBusyId(invitation.id);

    try {
      const confirmed = await confirmRevokeTeamInvitation(
        invitation.email,
        async () => {
          await revokeTeamInvitation(invitation.id);
        },
      );

      if (!confirmed) return;

      setInvitations((previous) =>
        previous.map((item) =>
          item.id === invitation.id
            ? {
                ...item,
                status: "revoked",
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      );

      setGeneratedLinks((previous) => {
        const next = { ...previous };
        delete next[invitation.id];
        return next;
      });
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = invitations.filter(
    (item) =>
      item.status === "pending" &&
      new Date(item.expires_at).getTime() > Date.now(),
  ).length;

  return (
    <section className="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      {/* Cabecera */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/40">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>

            <h2 className="text-sm font-semibold text-foreground">
              Invitaciones del equipo
            </h2>

            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              {pendingCount} pendientes
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Consulta invitaciones, comparte los enlaces de activación y controla
            quién tiene acceso pendiente.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLocalRefreshVersion((version) => version + 1)}
          disabled={loading}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Actualizar
        </button>
      </header>

      {/* Cargando */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-border p-4"
            >
              <div className="h-4 w-44 rounded bg-muted" />
              <div className="mt-3 h-3 w-64 max-w-full rounded bg-muted" />
              <div className="mt-4 h-8 w-36 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error */
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                No se pudieron cargar las invitaciones
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                {error}
              </p>

              <button
                type="button"
                onClick={() => setLocalRefreshVersion((version) => version + 1)}
                className="mt-3 inline-flex h-8 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      ) : invitations.length === 0 ? (
        /* Sin invitaciones */
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted/40">
            <UserRound className="h-5 w-5 text-muted-foreground" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-foreground">
            No hay invitaciones todavía
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
            Cuando invites a una persona que aún no tenga cuenta, su invitación
            aparecerá aquí. Podrás volver a generar su enlace aunque cierres el
            modal original.
          </p>
        </div>
      ) : (
        /* Lista de invitaciones */
        <div className="space-y-3">
          {invitations.map((invitation) => {
            const generated = generatedLinks[invitation.id];
            const isBusy = busyId === invitation.id;
            const expired = isExpired(invitation);

            const canGenerateLink =
              invitation.status === "pending" ||
              invitation.status === "expired";

            const whatsappUrl = generated
              ? `https://wa.me/?text=${encodeURIComponent(
                  `Hola ${invitation.full_name}, te invito a unirte al equipo de Food360. Puedes continuar desde este enlace: ${generated.inviteUrl}`,
                )}`
              : null;

            return (
              <article
                key={invitation.id}
                className="overflow-hidden rounded-xl border border-border transition-colors hover:border-border/80"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-sm font-semibold text-foreground">
                        {invitation.full_name}
                      </h3>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                          expired && invitation.status === "pending"
                            ? "expired"
                            : invitation.status,
                        )}`}
                      >
                        {invitation.status === "accepted" ? (
                          <Check className="h-3 w-3" />
                        ) : invitation.status === "revoked" ? (
                          <XCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}

                        {expired
                          ? STATUS_LABELS.expired
                          : STATUS_LABELS[invitation.status]}
                      </span>
                    </div>

                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      {invitation.email}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {TEAM_ROLE_LABELS[invitation.role]}
                      </span>

                      <span>Creada: {formatDate(invitation.created_at)}</span>

                      <span>Caduca: {formatDate(invitation.expires_at)}</span>
                    </div>

                    {invitation.status === "accepted" &&
                      invitation.accepted_at && (
                        <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-300">
                          Aceptada: {formatDate(invitation.accepted_at)}
                        </p>
                      )}
                  </div>

                  {canManageInvitations && canGenerateLink && (
                    <button
                      type="button"
                      onClick={() => void handleGenerateLink(invitation)}
                      disabled={isBusy || busyId !== null}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBusy ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Link2 className="h-3.5 w-3.5" />
                      )}

                      {expired ? "Renovar enlace" : "Generar enlace nuevo"}
                    </button>
                  )}
                </div>

                {/* Enlace generado durante esta sesión */}
                {generated && (
                  <div className="space-y-3 border-t border-border bg-muted/20 p-4">
                    <div>
                      <label
                        htmlFor={`invitation-link-${invitation.id}`}
                        className="mb-1.5 block text-xs font-semibold text-foreground"
                      >
                        Nuevo enlace de activación
                      </label>

                      <input
                        id={`invitation-link-${invitation.id}`}
                        readOnly
                        value={generated.inviteUrl}
                        onFocus={(event) => event.currentTarget.select()}
                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                      />

                      <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
                        Caduca: {formatDate(generated.expiresAt)}. Generar otro
                        enlace invalidará este.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleCopyLink(invitation.id)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copiar enlace
                      </button>

                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Compartir por WhatsApp
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Revocar */}
                {canManageInvitations && canGenerateLink && (
                  <div className="flex justify-end border-t border-border px-4 py-2">
                    <button
                      type="button"
                      onClick={() => void handleRevoke(invitation)}
                      disabled={isBusy || busyId !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Revocar invitación
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
