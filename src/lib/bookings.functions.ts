import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const bookingSchema = z.object({
  starts_at: z.string().min(1),
  level: z.enum(["total_beginner", "beginner", "intermediate", "advanced"]),
  first_name: z.string().trim().min(1).max(60),
  last_name: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().min(4).max(30),
  photo_url: z.string().max(400000).nullable().optional(),
  duration: z.number().int().min(30).max(240),
  camp: z.boolean().optional(),
  venue: z.enum(["alemannia", "longline"]).default("alemannia"),
  non_member: z.boolean().default(false),
});

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(bookingSchema)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const email = u?.user?.email_confirmed_at ? u.user.email : null;
    if (!email) throw new Error("Please confirm your email address before booking.");
    const { createBookingRecord } = await import("./bookings.server");
    // Notifications always go to the signed-in account's verified email.
    return createBookingRecord({ ...data, email, user_id: context.userId });
  });

/** Bookings of the signed-in student only. */
export const listMyBookings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listMyBookingsRecord } = await import("./bookings.server");
    return listMyBookingsRecord(context.userId);
  });

/** Cancels one booking, only if it belongs to the signed-in student.
 *  The account password is required as a second check. */
export const cancelMyBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), password: z.string().min(1).max(200) }))
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string }).email;
    if (!email) return { status: "bad_password" as const };
    const { verifyAccountPassword, cancelOwnBookingRecord } = await import("./bookings.server");
    const ok = await verifyAccountPassword(email, data.password);
    if (!ok) return { status: "bad_password" as const };
    return cancelOwnBookingRecord(context.userId, data.id);
  });

/** Attaches bookings made before signup (same email) to the account. */
export const claimMyBookings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { attachBookingsToAccount } = await import("./bookings.server");
    return attachBookingsToAccount(context.userId);
  });

export const confirmCancellation = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { confirmCancellationRecord } = await import("./bookings.server");
    return confirmCancellationRecord(data.token);
  });

/** Credit balance of the signed-in student. */
export const getMyCredits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getCreditSummary } = await import("./bookings.server");
    return getCreditSummary(context.userId);
  });

/** Registered tournament players (first name + initial, public). */
export const getTournamentSpots = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("tournament_players");
  if (error) throw new Error(error.message);
  return (data ?? []) as { first_name: string; last_initial: string }[];
});

/** Reserves one individual tournament spot for the signed-in student. */
export const joinTournament = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
        first_name: z.string().trim().min(1).max(60),
    last_name: z.string().trim().min(1).max(60),
    partner_discount: z.boolean(),
  }))
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string }).email;
    if (!email) return { ok: false as const, error: "no_email" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { configureBookingDelivery, deliverBookingNotifications } = await import("./bookings.server");
    await configureBookingDelivery();
    const { data: res, error } = await supabaseAdmin.rpc("join_tournament", { p: { ...data, email, user_id: context.userId } });
    if (error) throw new Error(error.message);
    await deliverBookingNotifications().catch(() => {});
    return res as { ok: boolean; error?: string; price_cents?: number };
  });

/** Is the signed-in student registered for the tournament? */
export const getMyTournament = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("my_tournament", { p_user: context.userId });
    if (error) throw new Error(error.message);
    return { registered: Boolean(data) };
  });

/** Cancels the student's own tournament spot (allowed until 15 days before). */
export const cancelTournament = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { configureBookingDelivery, deliverBookingNotifications } = await import("./bookings.server");
    await configureBookingDelivery();
    const { data, error } = await supabaseAdmin.rpc("cancel_tournament", { p_user: context.userId });
    if (error) throw new Error(error.message);
    await deliverBookingNotifications().catch(() => {});
    return data as { ok: boolean; error?: string };
  });
