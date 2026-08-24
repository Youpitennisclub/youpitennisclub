import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { coachEmail, sendMail, siteUrl, wrap } from "./mailer.server";

export type Level = "beginner" | "intermediate" | "advanced";

const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

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
  const name = `${input.first_name} ${input.last_name}`;

  await sendMail({
    to: coachEmail(),
    subject: `RESERVATION 🎾 — ${name} — ${when}`,
    replyTo: input.email,
    html: wrap(
      "RESERVATION",
      `<p style="font-size:20px"><b>${when}</b><br/>${input.duration} minutes${input.camp ? " · Summer camp" : ""}</p>
       <p style="font-size:17px;line-height:1.7">
       <b>First name:</b> ${input.first_name}<br/>
       <b>Last name:</b> ${input.last_name}<br/>
       <b>Phone:</b> ${input.phone}<br/>
       <b>Level:</b> ${input.level}<br/>
       <b>Email:</b> ${input.email}
       </p>`,
    ),
  });

  await sendMail({
    to: input.email,
    subject: `RESERVATION 🎾 — ${when}`,
    replyTo: coachEmail(),
    html: wrap(
      "RESERVATION confirmed",
      `<p style="font-size:20px"><b>${when}</b><br/>${input.duration} minutes</p>
       <p>See you on court, ${input.first_name}!</p>
       <p style="font-size:18px"><b>Cancellation: only possible up to 24 hours before the session starts.</b></p>
       <p>Need to cancel? Request it here and confirm with the link we email you:<br/>
       <a href="${siteUrl()}/book#cancel">${siteUrl()}/book#cancel</a></p>`,
    ),
  });

  return { ok: true as const, id: data.id };
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
       <b>Level:</b> ${s.level}<br/>
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
         <b>Level:</b> ${s.level}<br/>
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
       <b>Level:</b> ${data.level}<br/>
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
    .select("id, starts_at, level, first_name, last_name, cancelled_at")
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
       <b>Level:</b> ${data.level}<br/>
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
