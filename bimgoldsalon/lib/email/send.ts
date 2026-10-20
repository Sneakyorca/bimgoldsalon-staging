import "server-only";
import { BRAND } from "./brand";

export type Mail = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  replyTo?: string;
};

const toText = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<(br|\/p|\/tr|\/h1|\/div)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/**
 * Sends one email through Brevo. Never throws: a failed email must not break
 * a payment or a booking. Returns whether Brevo accepted it.
 */
export async function sendEmail(mail: Mail): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn(
      "[email] BREVO_API_KEY or EMAIL_FROM not set, skipped:",
      mail.subject,
    );
    return false;
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": key,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.EMAIL_FROM_NAME || BRAND.name,
          email: from,
        },
        to: [{ email: mail.to, ...(mail.toName ? { name: mail.toName } : {}) }],
        ...(mail.replyTo ? { replyTo: { email: mail.replyTo } } : {}),
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: toText(mail.html),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("[email] Brevo rejected it:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] could not reach Brevo:", e);
    return false;
  }
}
