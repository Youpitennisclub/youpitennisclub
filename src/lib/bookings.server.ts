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

/** Step 1: student asks for a cancellation → confirmation link sent to their email. */
export async function requestCancellationRecord(email: string) {
  const now = Date.now();
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, starts_at, cancel_token, first_name, last_name, email, level")
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
  }

  // Always the same answer, so the form cannot be used to probe emails.
  return { ok: true as const };
}

/** Step 2: student clicks the emailed link. */
export async function confirmCancellationRecord(token: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, starts_at, first_name, last_name, email, phone, cancelled_at")
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
    subject: `ANNULATION ❌ — ${name} — ${when}`,
    replyTo: data.email,
    html: wrap(
      "ANNULATION",
      `<p style="font-size:20px"><b>${when}</b></p>
       <p><b>Student:</b> ${name}<br/><b>Email:</b> ${data.email}<br/><b>Phone:</b> ${data.phone}</p>
       <p>The spot is free again and the name was removed from the calendar.</p>`,
    ),
  });

  await sendMail({
    to: data.email,
    subject: `ANNULATION ❌ — ${when}`,
    replyTo: coachEmail(),
    html: wrap("Cancellation confirmed", `<p style="font-size:20px"><b>${when}</b> is cancelled. Hope to see you soon on court!</p>`),
  });

  return { status: "cancelled" as const, starts_at: data.starts_at };
}
