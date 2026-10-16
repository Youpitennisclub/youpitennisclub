import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { coachEmail, sendMail, siteUrl, wrap } from "./mailer.server";
import { isOutdoorSlot, sessionPriceCents } from "./prices";
import { canCancelFree } from "./booking-rules";

export type Venue = "alemannia" | "longline";
export type Level = "total_beginner" | "beginner" | "intermediate" | "advanced";

function berlinHour(iso: string) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", hour12: false }).format(new Date(iso)));
}
function berlinYmd(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
  return ["year", "month", "day"].map(t => parts.find(p => p.type === t)?.value).join("-");
}

export async function getCreditSummary(userId: string) {
  const { data, error } = await supabaseAdmin.from("student_credits").select("balance_cents").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  const balance = data?.balance_cents ?? 0;
  return { balance_cents: balance, reserved_cents: 0, available_cents: balance };
}

export async function verifyAccountPassword(email: string, password: string) {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Missing Supabase server environment variables.");

  const client = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  return !error && !!data.user;
}


function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));
}

export async function configureBookingDelivery() {
  const secret = process.env["BOOKING_NOTIFICATION_SECRET"];
  if (!secret) return;
  const { error } = await supabaseAdmin.from("booking_delivery_config").upsert({ id: true, callback_url: `${siteUrl()}/api/public/booking-notifications`, secret });
  if (error) throw new Error("Cannot configure booking notifications");
}

export async function deliverBookingNotifications() {
  const { data, error } = await supabaseAdmin.rpc("claim_booking_notifications");
  if (error) throw new Error(error.message);
  let sent = 0;
  for (const row of data ?? []) {
    try {
      const result = await sendMail({ to: row.recipient, subject: row.subject, replyTo: coachEmail(), idempotencyKey: row.id, html: wrap(escapeHtml(row.subject), `<p>${escapeHtml(row.body).replace(/\n/g, "<br/>")}</p><p><a href="${siteUrl()}/book">My bookings</a></p>`) });
      if (result.sent) {
        const { error: updateError } = await supabaseAdmin.from("booking_notifications").update({ sent_at: new Date().toISOString(), locked_until: null }).eq("id", row.id);
        if (updateError) throw new Error(updateError.message);
        sent++;
      } else {
        await supabaseAdmin.from("booking_notifications").update({ locked_until: null, next_attempt_at: new Date(Date.now() + Math.min(60, 2 ** row.attempts) * 60000).toISOString() }).eq("id", row.id);
      }
    } catch {
      await supabaseAdmin.from("booking_notifications").update({ locked_until: null, next_attempt_at: new Date(Date.now() + 5 * 60000).toISOString() }).eq("id", row.id);
    }
  }
  return { sent };
}

export async function createBookingRecord(input: {
  starts_at: string; level: Level; venue: Venue; first_name: string; last_name: string;
  email: string; phone: string; photo_url?: string | null; duration: number; camp?: boolean; non_member: boolean; user_id: string;
}) {
  const hour = berlinHour(input.starts_at);
  const outdoor = isOutdoorSlot(input.venue, berlinYmd(input.starts_at), hour);
  const prices = [2, 3, 4].map(players => sessionPriceCents({ venue: input.venue, hour, players, nonMember: input.non_member, duration: input.duration, outdoor }));
  await configureBookingDelivery();
  const { data, error } = await supabaseAdmin.rpc("create_booking_v2", { p: { ...input, price_two: prices[0], price_three: prices[1], price_four: prices[2] } });
  if (error) throw new Error(error.message);
  await deliverBookingNotifications().catch(() => {});
  return data as { ok: true; id: string; confirmed: boolean; count: number; paidFromCredits: boolean };
}

type CancellationResult = { status: "cancelled" | "cancelled_due" | "already" | "too_late" | "invalid"; starts_at?: string };
async function cancelRecord(id: string, ownerId?: string, token?: string): Promise<CancellationResult> {
  await configureBookingDelivery();
  const { data, error } = await supabaseAdmin.rpc("cancel_booking_v2", { booking_id: id, owner_id: ownerId, token });
  if (error) throw new Error(error.message);
  await deliverBookingNotifications().catch(() => {});
  return data as CancellationResult;
}
export async function cancelOwnBookingRecord(userId: string, bookingId: string) {
  return cancelRecord(bookingId, userId);
}
export async function confirmCancellationRecord(token: string): Promise<CancellationResult> {
  const { data, error } = await supabaseAdmin.from("bookings").select("id").eq("cancel_token", token).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return { status: "invalid" };
  return cancelRecord(data.id, undefined, token);
}
export async function cancelByEmailRecord(email: string) {
  // Legacy email-only cancellation must verify ownership through emailed links.
  return requestCancellationRecord(email);
}
export async function requestCancellationRecord(email: string) {
  const { data, error } = await supabaseAdmin.from("bookings").select("starts_at,cancel_token").ilike("email", email).is("cancelled_at", null).gt("starts_at", new Date().toISOString());
  if (error) throw new Error(error.message);
  if (data?.length) await sendMail({ to: email, subject: "Confirm your cancellation — Youpi Tennis Club", replyTo: coachEmail(), html: wrap("Confirm your cancellation", `<p>Cancellation is free at least 48 hours before the session. Within 48 hours the session remains due unless replaced.</p><ul>${data.map(b => `<li>${escapeHtml(b.starts_at)} — <a href="${siteUrl()}/cancel?token=${b.cancel_token}">Cancel this session</a></li>`).join("")}</ul>`) });
  return { ok: true as const };
}
export async function attachBookingsToAccount(userId: string, email: string) {
  const { error } = await supabaseAdmin.from("bookings").update({ user_id: userId }).is("user_id", null).ilike("email", email);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}
export async function listMyBookingsRecord(userId: string) {
  const { data, error } = await supabaseAdmin.from("bookings").select("id,starts_at,level,venue,free_cancel_override,payment_due,cancelled_at").eq("user_id", userId).gte("starts_at", new Date().toISOString()).order("starts_at");
  if (error) throw new Error(error.message);
  return (data ?? []).filter(b => !b.cancelled_at || b.payment_due).map(b => ({ id: b.id, starts_at: b.starts_at, level: b.level as Level, venue: b.venue as Venue, cancellable: canCancelFree(new Date(b.starts_at).getTime(), b.free_cancel_override), payment_due: b.payment_due, cancelled: Boolean(b.cancelled_at) }));
}
