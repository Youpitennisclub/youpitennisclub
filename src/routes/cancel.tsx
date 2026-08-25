import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { confirmCancellation } from "@/lib/bookings.functions";

type Status = "loading" | "cancelled" | "already" | "too_late" | "invalid" | "error";

export const Route = createFileRoute("/cancel")({
  head: () => ({
    meta: [
      { title: "Cancel your session — Youpi Tennis Club Berlin" },
      {
        name: "description",
        content:
          "Confirm the cancellation of your tennis session with Youpi Tennis Club Berlin. Cancellation is possible up to 24 hours before the lesson starts.",
      },
      { property: "og:title", content: "Cancel your session — Youpi Tennis Club" },
      {
        property: "og:description",
        content: "Confirm your cancellation. Possible up to 24 hours before the session.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, follow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CancelPage,
});

function CancelPage() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    if (!token) {
      setStatus("invalid");
      return;
    }
    confirmCancellation({ data: { token } })
      .then((r) => setStatus(r.status))
      .catch(() => setStatus("error"));
  }, []);

  const text: Record<Status, { t: string; p: string }> = {
    loading: { t: "Checking…", p: "One moment please." },
    cancelled: {
      t: "Cancellation confirmed ❌",
      p: "Your spot is released and your name was removed from the calendar. Youpi has been notified.",
    },
    already: { t: "Already cancelled", p: "This session was already cancelled." },
    too_late: {
      t: "Too late to cancel",
      p: "Cancellation is only possible up to 24 hours before the session starts. Please contact Youpi directly.",
    },
    invalid: { t: "Invalid link", p: "This cancellation link is not valid anymore." },
    error: { t: "Something went wrong", p: "Please try again or contact Youpi directly." },
  };

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-5 sm:px-6 py-16 text-left">
      <Link to="/" className="font-display text-xl sm:text-2xl uppercase">
        Youpi Tennis Club
      </Link>
      <h1 className="mt-10 font-display text-3xl sm:text-4xl uppercase break-words">
        {text[status].t}
      </h1>
      <p className="mt-4 text-muted-foreground">{text[status].p}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/book"
          className="px-6 py-3.5 rounded-full bg-violet text-violet-foreground font-semibold hover:opacity-90 transition"
        >
          Back to the calendar
        </Link>
        <Link
          to="/contact"
          className="px-6 py-3.5 rounded-full border-2 border-ink/15 font-semibold hover:bg-ball/40 transition"
        >
          Contact
        </Link>
      </div>
    </main>
  );
}
