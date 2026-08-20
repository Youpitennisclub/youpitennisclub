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
  return `<div style="font-family:system-ui,sans-serif;line-height:1.5;color:#101c17">
    <h1 style="font-size:26px;margin:0 0 16px">${title}</h1>
    ${body}
    <p style="margin-top:28px;font-size:12px;color:#6b7280">Youpi Tennis Club · Berlin</p>
  </div>`;
}
