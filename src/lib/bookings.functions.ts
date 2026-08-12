import { createServerFn } from "@tanstack/react-start";
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
  .inputValidator(bookingSchema)
  .handler(async ({ data }) => {
    const { createBookingRecord } = await import("./bookings.server");
    return createBookingRecord(data);
  });

export const requestCancellation = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().trim().email().max(120) }))
  .handler(async ({ data }) => {
    const { requestCancellationRecord } = await import("./bookings.server");
    return requestCancellationRecord(data.email);
  });

export const confirmCancellation = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { confirmCancellationRecord } = await import("./bookings.server");
    return confirmCancellationRecord(data.token);
  });
