"use client";

import { useState, type FormEvent } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  TEAM_ROLE_LABELS,
  type InviteableTeamRole,
  type InviteTeamMemberInput,
  type TeamInvitationResult,
} from "@/types/team";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (
    memberData: InviteTeamMemberInput,
  ) => Promise<TeamInvitationResult>;
  canInviteAdmin: boolean;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
  canInviteAdmin,
}: InviteMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<InviteableTeamRole>("waiter");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TeamInvitationResult | null>(null);

  if (!isOpen) return null;

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setRole("waiter");
    setError(null);
    setResult(null);
  }

  function handleClose() {
    if (isSubmitting) return;

    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || result) return;

    setError(null);

    const memberData: InviteTeamMemberInput = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
    };

    if (!memberData.name || !memberData.email) {
      setError("El nombre y el correo son obligatorios.");
      return;
    }

    setIsSubmitting(true);

    try {
      const invitation = await onInvite(memberData);

      setResult(invitation);

      toast.success(
        invitation.accountAlreadyExists
          ? "Miembro añadido al restaurante."
          : "Invitación preparada correctamente.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo preparar la invitación.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyInvitationLink() {
    if (!result?.inviteUrl) return;

    try {
      await navigator.clipboard.writeText(result.inviteUrl);
      toast.success("Enlace copiado al portapapeles.");
    } catch {
      toast.error(
        "No se pudo copiar automáticamente. Selecciona el enlace y cópialo.",
      );
    }
  }

  const whatsappUrl = result?.inviteUrl
    ? `https://wa.me/?text=${encodeURIComponent(
        `Hola ${result.name}, te invito a unirte al equipo de Food360. Puedes activar tu cuenta desde este enlace: ${result.inviteUrl}`,
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-overlay p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-member-title"
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2
              id="invite-member-title"
              className="text-base font-bold text-foreground"
            >
              {result ? "Invitación preparada" : "Invitar nuevo miembro"}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {result
                ? "Comparte el acceso con la persona invitada."
                : "Añade los datos y asigna un rol al miembro."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Resultado de la invitación */}
        {result ? (
          <div className="space-y-5 p-6">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background">
                <Check className="h-4 w-4 text-success" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {result.accountAlreadyExists
                    ? "Miembro añadido"
                    : "Enlace generado correctamente"}
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {result.accountAlreadyExists
                    ? "La cuenta existente se ha añadido al restaurante. Puede acceder con sus credenciales habituales."
                    : `Comparte el enlace con ${result.name} para que pueda continuar con la activación de su cuenta.`}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">
                Datos del miembro
              </p>

              <div className="rounded-xl border border-border p-3">
                <p className="text-sm font-medium text-foreground">
                  {result.name}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {result.email}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Rol: {TEAM_ROLE_LABELS[result.role]}
                </p>
              </div>
            </div>

            {result.inviteUrl && (
              <>
                <div>
                  <label
                    htmlFor="invitation-link"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Enlace de activación
                  </label>

                  <input
                    id="invitation-link"
                    type="text"
                    readOnly
                    value={result.inviteUrl}
                    onFocus={(event) => event.currentTarget.select()}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />

                  <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                    Comparte este enlace únicamente con la persona invitada.
                    {result.expiresAt && (
                      <>
                        {" "}Caduca el{" "}
                        {new Date(result.expiresAt).toLocaleString("es-VE", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        .
                      </>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void copyInvitationLink()}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar enlace
                  </button>

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="h-10 w-full rounded-lg border border-border px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Listo
            </button>
          </div>
        ) : (
          /* Formulario */
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label
                htmlFor="invite-name"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Nombre completo
              </label>

              <input
                id="invite-name"
                type="text"
                required
                maxLength={120}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Carlos Mendoza"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground outline-none transition-all focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="invite-email"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Correo electrónico
              </label>

              <input
                id="invite-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="carlos@food360.com"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground outline-none transition-all focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="invite-phone"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Teléfono
              </label>

              <input
                id="invite-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0424-1234567"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground outline-none transition-all focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="invite-role"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Rol asignado
              </label>

              <select
                id="invite-role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as InviteableTeamRole)
                }
                disabled={isSubmitting}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground outline-none transition-all focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="chef">{TEAM_ROLE_LABELS.chef}</option>

                {canInviteAdmin && (
                  <option value="admin">{TEAM_ROLE_LABELS.admin}</option>
                )}

                <option value="waiter">{TEAM_ROLE_LABELS.waiter}</option>
                <option value="cashier">{TEAM_ROLE_LABELS.cashier}</option>
              </select>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
              >
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center cursor-pointer gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Preparando...
                  </>
                ) : (
                  "Generar invitación"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
