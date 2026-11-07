import nodemailer from "nodemailer";

interface TeamInvitationEmailInput {
  to: string;
  name: string;
  role: string;
  inviteUrl: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  chef: "Jefe de cocina",
  waiter: "Mesero",
  cashier: "Caja / POS",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

function createSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secureValue = process.env.SMTP_SECURE;
  const secure =
    secureValue === undefined
      ? port === 465
      : secureValue.toLowerCase() === "true";

  const user = process.env.SMTP_USER;
  // Google muestra la contraseña de aplicación con espacios.
  // Los eliminamos también aquí por seguridad.
  const pass = process.env.SMTP_PASSWORD?.replace(/\s+/g, "");

  if (!host || !user || !pass || !Number.isInteger(port)) {
    throw new Error("La configuración SMTP está incompleta.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = createSmtpTransporter();
  }

  return transporter;
}

export async function sendTeamInvitationEmail(
  input: TeamInvitationEmailInput,
): Promise<{ messageId: string }> {
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || "Food360";

  if (!fromEmail) {
    throw new Error("No se configuró el remitente del correo.");
  }

  const roleLabel = ROLE_LABELS[input.role] || input.role;

  const safeName = escapeHtml(input.name);
  const safeRole = escapeHtml(roleLabel);
  const safeUrl = escapeHtml(input.inviteUrl);

  const text = `
Hola ${input.name},

Has recibido una invitación para unirte al equipo de Food360.

Tu rol asignado es: ${roleLabel}.

Para completar tu registro y establecer tu contraseña, abre el siguiente enlace:

${input.inviteUrl}

Este enlace tiene una vigencia de 7 días.

Si no esperabas esta invitación, puedes ignorar este mensaje.

Food360
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitación a Food360</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#222;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="padding:28px 32px;background:#172d26;color:#ffffff;">
        <h1 style="margin:0;font-size:24px;letter-spacing:-0.5px;">
          Food360
        </h1>
        <p style="margin:8px 0 0;color:#d1ddd6;font-size:13px;">
          Gestión inteligente para restaurantes
        </p>
      </div>

      <div style="padding:32px;">
        <h2 style="margin:0 0 16px;font-size:21px;">
          ¡Hola, ${safeName}!
        </h2>

        <p style="margin:0 0 18px;color:#525252;font-size:14px;line-height:1.7;">
          Has recibido una invitación para formar parte de un equipo en Food360.
        </p>

        <div style="padding:16px;background:#f7f8f7;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:11px;color:#737373;">
            TU ROL ASIGNADO
          </p>
          <p style="margin:0;font-size:15px;font-weight:bold;">
            ${safeRole}
          </p>
        </div>

        <p style="margin:0 0 20px;color:#525252;font-size:14px;line-height:1.7;">
          Para aceptar la invitación, completar tu registro y establecer tu contraseña,
          utiliza el siguiente botón:
        </p>

        <div style="text-align:center;margin:28px 0;">
          <a
            href="${safeUrl}"
            style="display:inline-block;padding:14px 28px;background:#244d3c;color:#ffffff;text-decoration:none;border-radius:9px;font-size:14px;font-weight:bold;"
          >
            Aceptar invitación
          </a>
        </div>

        <p style="margin:0 0 12px;color:#737373;font-size:12px;line-height:1.6;">
          Este enlace tiene una vigencia de 7 días. Si el botón no funciona,
          copia y pega esta dirección en tu navegador:
        </p>

        <p style="margin:0 0 24px;word-break:break-all;font-size:12px;">
          <a href="${safeUrl}" style="color:#315d49;">
            ${safeUrl}
          </a>
        </p>

        <div style="border-top:1px solid #e5e7eb;padding-top:18px;">
          <p style="margin:0;color:#858585;font-size:11px;line-height:1.6;">
            Si no esperabas esta invitación, puedes ignorar este correo.
            No se realizará ninguna acción en tu cuenta.
          </p>
        </div>
      </div>
    </div>

    <p style="margin:18px 0;text-align:center;color:#999;font-size:11px;">
      © ${new Date().getFullYear()} Food360. Todos los derechos reservados.
    </p>
  </div>
</body>
</html>
  `.trim();

  const info = await getTransporter().sendMail({
    from: {
      name: fromName,
      address: fromEmail,
    },
    to: input.to,
    subject: "Has recibido una invitación a Food360",
    text,
    html,
  });

  if (!info.accepted || info.accepted.length === 0) {
    throw new Error("El servidor SMTP no aceptó el destinatario.");
  }

  return {
    messageId: info.messageId,
  };
}
