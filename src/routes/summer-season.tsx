import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";

const TITLE = "Summer Season Tennis in Berlin — How It Works | Youpi Tennis Club";
const DESCRIPTION =
  "How the summer season works at Youpi Tennis Club Berlin: 90-min group sessions from 3 players, 60 min when only 2 registered, cancellation and rain policy.";

export const Route = createFileRoute("/summer-season")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://youpitennisclub.com/summer-season" }],
  }),
  component: SummerSeasonPage,
});

const RULES = [
  {
    i: "🎾",
    t: "90-min group sessions",
    d: "From 3 players — plenty of time for drills, tactics and point play.",
  },
  {
    i: "👥",
    t: "Only 2 registered?",
    d: "The session runs 60 min instead of 90.",
  },
  {
    i: "⏰",
    t: "Cancellation",
    d: "Less than 24h before the session, the full fee is charged.",
  },
  {
    i: "🌧️",
    t: "Rain policy",
    d: "More than 50% played → no refund. Less than 50% → full refund or reschedule, your call.",
  },
];

function SummerSeasonPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay">Summer season</p>
          <h1 className="mb-5 text-4xl font-display uppercase break-words sm:text-6xl">
            How <span className="text-clay">Summer season</span> works
          </h1>
        </div>

        <div className="rounded-3xl bg-brick text-background p-5 sm:p-8 md:p-10">
          <div className="grid md:grid-cols-2 gap-4">
            {RULES.map((r) => (
              <div key={r.t} className="rounded-2xl bg-background text-ink p-5 sm:p-6 md:p-7">
                <div className="text-3xl mb-2">{r.i}</div>
                <div className="font-display text-xl sm:text-2xl md:text-3xl uppercase mb-2 break-words">{r.t}</div>
                <p className="text-base md:text-lg text-ink/80">{r.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/book"
            className="inline-flex items-center rounded-full bg-violet px-8 py-3.5 font-semibold text-violet-foreground transition hover:opacity-90"
          >
            Book your lesson
          </Link>
        </div>
      </section>
    </main>
  );
}
