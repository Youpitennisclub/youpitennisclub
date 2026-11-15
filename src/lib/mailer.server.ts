/** Server-only email helper. Uses Resend when RESEND_API_KEY is configured. */

const COACH_EMAIL = "youpitennisclub@gmail.com";

export function coachEmail() {
  return COACH_EMAIL;
}

export function siteUrl() {
  return process.env["SITE_URL"] ?? "https://youpitennisclub.lovable.app";
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  idempotencyKey?: string;
}) {
  const key = process.env["RESEND_API_KEY"];
  const from = process.env["EMAIL_FROM"] ?? "Youpi Tennis Club <booking@youpitennisclub.com>";

  if (!key) {
    console.warn("[mail] RESEND_API_KEY missing — email not sent:", opts.subject, "→", opts.to);
    return { sent: false as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    console.error("[mail] send failed", res.status, await res.text());
    return { sent: false as const };
  }
  return { sent: true as const };
}

export function wrap(title: string, body: string) {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:18px;line-height:1.7;color:#101c17;max-width:560px;margin:0 auto;padding:20px 16px">
    <h1 style="font-size:22px;line-height:1.3;margin:0 0 18px;letter-spacing:0.02em">${title}</h1>
    ${body}
    <p style="margin-top:28px;font-size:12px;color:#6b7280">Youpi Tennis Club · Berlin</p>
  </div>`;
}
