import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/booking-notifications")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["BOOKING_NOTIFICATION_SECRET"];
        if (!secret || request.headers.get("Authorization") !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { deliverBookingNotifications } = await import("@/lib/bookings.server");
        return Response.json(await deliverBookingNotifications());
      },
    },
  },
});