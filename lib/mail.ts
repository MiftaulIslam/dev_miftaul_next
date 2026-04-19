import "server-only";

import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE ?? "true") === "true";
const SMTP_USER = process.env.SMTP_USER ?? "miftaulislam005@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS;

export function canSendMail() {
  return Boolean(SMTP_USER && SMTP_PASS);
}

export async function sendContactEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!canSendMail()) {
    throw new Error("SMTP credentials are missing.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const recipient = process.env.MAIL_TO ?? SMTP_USER;
  await transporter.sendMail({
    from: `"Portfolio Contact" <${SMTP_USER}>`,
    to: recipient,
    replyTo: input.email,
    subject: `[Portfolio] ${input.subject}`,
    text: `Name: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
        <h2 style="margin:0 0 12px;">New Portfolio Message</h2>
        <p style="margin:0 0 6px;"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
        <p style="margin:0 0 12px;"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
        <p style="margin:0 0 6px;"><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
        <div style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:8px;">
          ${escapeHtml(input.message)}
        </div>
      </div>
    `,
  });

  await transporter.sendMail({
    from: `"Miftaul Islam" <${SMTP_USER}>`,
    to: input.email,
    subject: "Thanks for reaching out!",
    text: "Thanks for reaching out! I'm Miftaul Islam. I've received your message and will get back to you shortly.",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
        <p style="margin:0;">
          Thanks for reaching out! I'm Miftaul Islam. I've received your message and will get back to you shortly.
        </p>
      </div>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
