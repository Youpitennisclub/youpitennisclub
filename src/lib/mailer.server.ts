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
    console.warn("[mail] RESEND_API_KEY missing — email not sent");
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
    console.error("[mail] send failed", res.status);
    return { sent: false as const };
  }
  return { sent: true as const };
}

// Desktop sizes stay inline (Outlook & desktop clients). Mobile overrides live in a
// real <head><style> block (Gmail iOS/Android only honours <style> in <head>),
// use class selectors + !important so they beat the inline values.
const MOBILE_CSS = `@media only screen and (max-width:600px){
.yp-mail{font-size:14px!important;line-height:1.45!important;padding:12px 10px!important}
.yp-h1{font-size:17px!important;line-height:1.25!important;margin:0 0 8px!important}
.yp-mail p,.yp-p{font-size:14px!important;line-height:1.45!important;margin:0 0 8px!important}
.yp-mail ul,.yp-mail li{font-size:14px!important;line-height:1.45!important;margin-top:0!important;margin-bottom:6px!important}
.yp-mail .yp-policy{font-size:13px!important;padding:8px 10px!important;margin:10px 0 0!important}
.yp-small{font-size:12px!important}
.yp-mail .yp-cta{margin:12px 0 0!important}
.yp-btn{font-size:14px!important;padding:8px 16px!important}
.yp-mail .yp-foot{font-size:11px!important;margin:12px 0 0!important}
}`;

export function wrap(title: string, body: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><style>${MOBILE_CSS}</style></head><body style="margin:0;padding:0;background:#ffffff;-webkit-text-size-adjust:100%;text-size-adjust:100%"><div class="yp-mail" style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:18px;line-height:1.7;color:#101c17;max-width:560px;margin:0 auto;padding:20px 16px">
    <h1 class="yp-h1" style="font-size:22px;line-height:1.3;margin:0 0 18px;letter-spacing:0.02em">${title}</h1>
    ${body}
    <p class="yp-foot" style="margin-top:28px;font-size:12px;color:#6b7280">Youpi Tennis Club · Berlin</p>
  </div></body></html>`;
}
