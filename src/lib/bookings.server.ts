import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { coachEmail, sendMail, siteUrl, wrap } from "./mailer.server";

/** Re-checks the account password before a sensitive action (cancellation). */
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

export type Venue = "alemannia" | "longline";

const VENUE_NAME: Record<Venue, string> = {
  alemannia: "BFC Alemannia",
  longline: "TC Longline",
};
/** Pretty club name for emails. */
const vn = (v: Venue) => VENUE_NAME[v] ?? v;

export type Level = "total_beginner" | "beginner" | "intermediate" | "advanced";

const LEVEL_NAME: Record<Level, string> = {
  total_beginner: "Total beginner",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
/** Pretty level name for emails. */
const lv = (l: Level) => LEVEL_NAME[l] ?? l;

const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;
/** Students of the same level needed on a slot before it is confirmed. */
function groupMinFor(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", weekday: "short", hour: "2-digit", hour12: false }).formatToParts(new Date(iso));
  const wd = parts.find((p) => p.type === "weekday")?.value;
  const h = Number(parts.find((p) => p.type === "hour")?.value);
  if (wd === "Sat" || wd === "Sun") return 4;
  // Late afternoon (15:00–17:00) needs a full group of 4.
  return h >= 15 ? 4 : 2;
}
/** Intermediate and Advanced can form a group together. */
function levelGroup(l: Level): Level[] {
  return l === "intermediate" || l === "advanced" ? ["intermediate", "advanced"] : [l];
}

function fmt(dt: string) {
  return new Date(dt).toLocaleString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

export async function createBookingRecord(input: {
  starts_at: string;
  level: Level;
  venue: Venue;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string | null;
  duration: number;
  camp?: boolean;
  user_id: string;
}) {
  if (new Date(input.starts_at).getTime() <= Date.now()) {
    throw new Error("This slot is in the past.");
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert({
      starts_at: input.starts_at,
      level: input.level,
      venue: input.venue,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: input.phone,
      photo_url: input.photo_url ?? null,
      user_id: input.user_id,
    })
    .select("id, cancel_token")
    .single();

  if (error) throw new Error(error.message);

  const when = fmt(input.starts_at);
  const where = vn(input.venue);
  const name = `${input.first_name} ${input.last_name}`;

  // Count active students of the same level already booked on this slot.
  const { data: group, error: gErr } = await supabaseAdmin
    .from("bookings")
    .select("id, first_name, last_name, email, confirmed_at")
    .eq("starts_at", input.starts_at)
    .eq("venue", input.venue)
    .in("level", levelGroup(input.level))
    .is("cancelled_at", null);
  if (gErr) throw new Error(gErr.message);
  const members = group ?? [];
  const GROUP_MIN = groupMinFor(input.starts_at);
  const count = members.length;
  const alreadyConfirmed = members.some((m) => m.confirmed_at && m.id !== data.id);

  if (count >= GROUP_MIN || alreadyConfirmed) {
    const toConfirm = members.filter((m) => !m.confirmed_at);
    await supabaseAdmin
      .from("bookings")
      .update({ confirmed_at: new Date().toISOString() })
      .in("id", toConfirm.map((m) => m.id));

    for (const m of toConfirm) {
      await sendMail({
        to: m.email,
        subject: `RESERVATION CONFIRMED 🎾 — ${where} — ${when}`,
        replyTo: coachEmail(),
        html: wrap(
          "Your group is confirmed!",
          `<p style="font-size:20px"><b>${when}</b><br/>📍 ${where}<br/>${input.duration} minutes · ${lv(input.level)} group (${count} players)</p>
           <p>See you on court, ${m.first_name}!</p>
           <p style="font-size:18px"><b>Cancellation: only possible up to 24 hours before the session starts.</b></p>
           <p><a href="${siteUrl()}/book">${siteUrl()}/book</a></p>`,
        ),
      });
    }
    await sendMail({
      to: coachEmail(),
      subject: `GROUP CONFIRMED ✅ — ${where} — ${lv(input.level)} — ${when}`,
      replyTo: input.email,
      html: wrap(
        "GROUP CONFIRMED",
        `<p style="font-size:20px"><b>${when}</b><br/>📍 ${where} · ${lv(input.level)} · ${count} players</p>
         <ul style="font-size:17px">${members.map((m) => `<li>${m.first_name} ${m.last_name} — ${m.email}</li>`).join("")}</ul>
         <p>Latest: ${name}, ${input.phone}</p>`,
      ),
    });
    return { ok: true as const, id: data.id, confirmed: true, count };
  }

  await sendMail({
    to: coachEmail(),
    subject: `BOOKING ⏳ ${count}/${GROUP_MIN} — ${where} — ${name} — ${when}`,
    replyTo: input.email,
    html: wrap(
      "BOOKING RECEIVED — waiting for players",
      `<p style="font-size:20px"><b>${when}</b><br/>📍 ${where}<br/>${input.duration} minutes · ${lv(input.level)} · ${count}/${GROUP_MIN}</p>
       <p style="font-size:17px;line-height:1.7">
       <b>Name:</b> ${name}<br/><b>Phone:</b> ${input.phone}<br/><b>Email:</b> ${input.email}</p>`,
    ),
  });
  await sendMail({
    to: input.email,
    subject: `BOOKING RECEIVED ⏳ — ${where} — ${when}`,
    replyTo: coachEmail(),
    html: wrap(
      "Booking received",
      `<p style="font-size:20px"><b>${when}</b><br/>📍 ${where}<br/>${lv(input.level)} group · ${count}/${GROUP_MIN} players</p>
       <p>As soon as ${GROUP_MIN} students of your level book this slot, the session is confirmed automatically and you'll get an email.</p>
       <p><a href="${siteUrl()}/book">${siteUrl()}/book</a></p>`,
    ),
  });

  return { ok: true as const, id: data.id, confirmed: false, count };
}

/** Immediate cancellation: cancels every upcoming session booked with this email
 *  that starts in more than 24h. No coach action needed. */
export async function cancelByEmailRecord(email: string) {
  const now = Date.now();
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, starts_at, first_name, last_name, email, phone, level")
    .ilike("email", email)
    .is("cancelled_at", null)
    .gte("starts_at", new Date(now).toISOString())
    .order("starts_at");

  if (error) throw new Error(error.message);

  const upcoming = data ?? [];
  const eligible = upcoming.filter(
    (b) => new Date(b.starts_at).getTime() - now > CANCEL_WINDOW_MS,
  );
  const tooLate = upcoming.filter(
    (b) => new Date(b.starts_at).getTime() - now <= CANCEL_WINDOW_MS,
  );

  if (eligible.length === 0) {
    return {
      status: (tooLate.length > 0 ? "too_late" : "none") as "too_late" | "none",
      cancelled: 0,
    };
  }

  const { error: upErr } = await supabaseAdmin
    .from("bookings")
    .update({ cancelled_at: new Date().toISOString() })
    .in(
      "id",
      eligible.map((b) => b.id),
    );
  if (upErr) throw new Error(upErr.message);

  const s = eligible[0]!;
  const list = eligible.map((b) => `<li>${fmt(b.starts_at)}</li>`).join("");

  await sendMail({
    to: coachEmail(),
    subject: `CANCELLATION ❌ — ${s.first_name} ${s.last_name} — ${fmt(s.starts_at)}`,
    replyTo: s.email,
    html: wrap(
      "CANCELLATION",
      `<p style="font-size:17px;line-height:1.7">
       <b>First name:</b> ${s.first_name}<br/>
       <b>Last name:</b> ${s.last_name}<br/>
       <b>Phone:</b> ${s.phone}<br/>
       <b>Level:</b> ${lv(s.level as Level)}<br/>
       <b>Email:</b> ${s.email}
       </p>
       <p style="font-size:17px"><b>Sessions cancelled:</b></p>
       <ul style="font-size:17px">${list}</ul>
       <p>The spots are free again and the names were removed from the calendar. No action needed from you.</p>`,
    ),
  });

  await sendMail({
    to: s.email,
    subject: `CANCELLATION ❌ — ${fmt(s.starts_at)}`,
    replyTo: coachEmail(),
    html: wrap(
      "Cancellation confirmed",
      `<p style="font-size:18px">These sessions are cancelled:</p>
       <ul style="font-size:18px">${list}</ul>
       <p>Hope to see you soon on court!</p>`,
    ),
  });

  return { status: "cancelled" as const, cancelled: eligible.length };
}

/** Legacy step 1: student asks for a cancellation → confirmation link sent to their email. */
export async function requestCancellationRecord(email: string) {


  const now = Date.now();
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, starts_at, cancel_token, first_name, last_name, email, phone, level")
    .ilike("email", email)
    .is("cancelled_at", null)
    .gte("starts_at", new Date(now).toISOString())
    .order("starts_at");

  if (error) throw new Error(error.message);

  const cancellable = (data ?? []).filter(
    (b) => new Date(b.starts_at).getTime() - now > CANCEL_WINDOW_MS,
  );

  if (cancellable.length > 0) {
    const rows = cancellable
      .map(
        (b) =>
          `<li style="margin-bottom:12px">${fmt(b.starts_at)} — <a href="${siteUrl()}/cancel?token=${b.cancel_token}">confirm cancellation</a></li>`,
      )
      .join("");

    await sendMail({
      to: cancellable[0]!.email,
      subject: "Confirm your cancellation — Youpi Tennis Club",
      replyTo: coachEmail(),
      html: wrap(
        "Confirm your cancellation",
        `<p>Click the link of the session you want to cancel. The cancellation is only final once confirmed.</p>
         <ul>${rows}</ul>
         <p style="font-size:18px"><b>Cancellation is only possible up to 24 hours before the session starts.</b></p>`,
      ),
    });

    const s = cancellable[0]!;
    await sendMail({
      to: coachEmail(),
      subject: `CANCELLATION REQUEST ⏳ — ${s.first_name} ${s.last_name}`,
      replyTo: s.email,
      html: wrap(
        "CANCELLATION REQUEST",
        `<p style="font-size:17px;line-height:1.7">
         <b>First name:</b> ${s.first_name}<br/>
         <b>Last name:</b> ${s.last_name}<br/>
         <b>Phone:</b> ${s.phone}<br/>
         <b>Level:</b> ${lv(s.level as Level)}<br/>
         <b>Email:</b> ${s.email}
         </p>
         <p style="font-size:17px"><b>Sessions concerned:</b></p>
         <ul style="font-size:17px">${cancellable.map((b) => `<li>${fmt(b.starts_at)}</li>`).join("")}</ul>
         <p>The student received the confirmation link. You'll get a second email once the cancellation is confirmed.</p>`,
      ),
    });
  }


  // Always the same answer, so the form cannot be used to probe emails.
  return { ok: true as const };
}

/** Step 2: student clicks the emailed link. */
export async function confirmCancellationRecord(token: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, starts_at, first_name, last_name, email, phone, level, cancelled_at")
    .eq("cancel_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return { status: "invalid" as const };
  if (data.cancelled_at) return { status: "already" as const, starts_at: data.starts_at };

  const startsIn = new Date(data.starts_at).getTime() - Date.now();
  if (startsIn <= CANCEL_WINDOW_MS) return { status: "too_late" as const, starts_at: data.starts_at };

  const { error: upErr } = await supabaseAdmin
    .from("bookings")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("id", data.id);
  if (upErr) throw new Error(upErr.message);

  const when = fmt(data.starts_at);
  const name = `${data.first_name} ${data.last_name}`;

  await sendMail({
    to: coachEmail(),
    subject: `CANCELLATION ❌ — ${name} — ${when}`,
    replyTo: data.email,
    html: wrap(
      "CANCELLATION",
      `<p style="font-size:20px"><b>${when}</b></p>
       <p style="font-size:17px;line-height:1.7">
       <b>First name:</b> ${data.first_name}<br/>
       <b>Last name:</b> ${data.last_name}<br/>
       <b>Phone:</b> ${data.phone}<br/>
       <b>Level:</b> ${lv(data.level as Level)}<br/>
       <b>Email:</b> ${data.email}
       </p>
       <p>The spot is free again and the name was removed from the calendar.</p>`,
    ),
  });

  await sendMail({
    to: data.email,
    subject: `CANCELLATION ❌ — ${when}`,
    replyTo: coachEmail(),
    html: wrap("Cancellation confirmed", `<p style="font-size:20px"><b>${when}</b> is cancelled. Hope to see you soon on court!</p>`),
  });

  return { status: "cancelled" as const, starts_at: data.starts_at };
}

/* =========================================================================
   ACCOUNT-BASED FLOW: a student signs in, sees only their own bookings and
   can cancel only those (up to 24h before the session starts).
   ========================================================================= */

/** Link past bookings made with the same email to the freshly created account. */
export async function attachBookingsToAccount(userId: string, email: string) {
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ user_id: userId })
    .is("user_id", null)
    .ilike("email", email);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function listMyBookingsRecord(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, starts_at, level, venue, first_name, last_name, cancelled_at")
    .eq("user_id", userId)
    .is("cancelled_at", null)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");

  if (error) throw new Error(error.message);

  const now = Date.now();
  return (data ?? []).map((b) => ({
    id: b.id,
    starts_at: b.starts_at,
    level: b.level as Level,
    cancellable: new Date(b.starts_at).getTime() - now > CANCEL_WINDOW_MS,
  }));
}

/** Cancels ONE booking, and only if it belongs to the signed-in account. */
export async function cancelOwnBookingRecord(userId: string, bookingId: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, starts_at, first_name, last_name, email, phone, level, cancelled_at, user_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || data.user_id !== userId) return { status: "invalid" as const };
  if (data.cancelled_at) return { status: "already" as const };

  if (new Date(data.starts_at).getTime() - Date.now() <= CANCEL_WINDOW_MS) {
    return { status: "too_late" as const };
  }

  const { error: upErr } = await supabaseAdmin
    .from("bookings")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("id", data.id)
    .eq("user_id", userId);
  if (upErr) throw new Error(upErr.message);

  const when = fmt(data.starts_at);
  const name = `${data.first_name} ${data.last_name}`;

  await sendMail({
    to: coachEmail(),
    subject: `CANCELLATION ❌ — ${name} — ${when}`,
    replyTo: data.email,
    html: wrap(
      "CANCELLATION",
      `<p style="font-size:20px"><b>${when}</b></p>
       <p style="font-size:17px;line-height:1.7">
       <b>First name:</b> ${data.first_name}<br/>
       <b>Last name:</b> ${data.last_name}<br/>
       <b>Phone:</b> ${data.phone}<br/>
       <b>Level:</b> ${lv(data.level as Level)}<br/>
       <b>Email:</b> ${data.email}
       </p>
       <p>Cancelled by the student from their account. The spot is free again and the name was removed from the calendar.</p>`,
    ),
  });

  await sendMail({
    to: data.email,
    subject: `CANCELLATION ❌ — ${when}`,
    replyTo: coachEmail(),
    html: wrap(
      "Cancellation confirmed",
      `<p style="font-size:20px"><b>${when}</b> is cancelled. Hope to see you soon on court!</p>`,
    ),
  });

  return { status: "cancelled" as const, starts_at: data.starts_at };
}
