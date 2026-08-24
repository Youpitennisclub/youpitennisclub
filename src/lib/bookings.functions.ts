import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const bookingSchema = z.object({
  starts_at: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  first_name: z.string().trim().min(1).max(60),
  last_name: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().min(4).max(30),
  photo_url: z.string().max(400000).nullable().optional(),
  duration: z.number().int().min(30).max(240),
  camp: z.boolean().optional(),
});

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(bookingSchema)
  .handler(async ({ data, context }) => {
    const { createBookingRecord } = await import("./bookings.server");
    return createBookingRecord({ ...data, user_id: context.userId });
  });

/** Bookings of the signed-in student only. */
export const listMyBookings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listMyBookingsRecord } = await import("./bookings.server");
    return listMyBookingsRecord(context.userId);
  });

/** Cancels one booking, only if it belongs to the signed-in student. */
export const cancelMyBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { cancelOwnBookingRecord } = await import("./bookings.server");
    return cancelOwnBookingRecord(context.userId, data.id);
  });

/** Attaches bookings made before signup (same email) to the account. */
export const claimMyBookings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims as { email?: string }).email;
    if (!email) return { ok: false as const };
    const { attachBookingsToAccount } = await import("./bookings.server");
    return attachBookingsToAccount(context.userId, email);
  });

export const confirmCancellation = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { confirmCancellationRecord } = await import("./bookings.server");
    return confirmCancellationRecord(data.token);
  });
