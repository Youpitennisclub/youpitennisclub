import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";

const TITLE = "Tennis events in Berlin — Tournaments & Summer Camp | Youpi Tennis Club";
const DESCRIPTION =
  "Tennis & Social in Berlin: single hobby tournament, mixed doubles tournament, singles vs. couples fun format and Summer Camp 2026. Meet people, network and have fun on court.";

export const Route = createFileRoute("/tennis-events")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://youpitennisclub.com/tennis-events" }],
  }),
  component: TennisEventsPage,
});

function TennisEventsPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <h1 translate="no" className="notranslate text-[clamp(1.75rem,7vw,3.75rem)] font-display uppercase mb-3 break-words">
          Tennis <span className="text-pink">&amp; Social</span>
        </h1>

        <p className="text-muted-foreground max-w-2xl mb-6">
          Meet people, network, and have fun. Relaxed formats designed for Berliners who want to play and connect.
        </p>

        <Link to="/book" className="mb-8 block rounded-3xl border-4 border-destructive bg-destructive/10 p-6 sm:p-8 shadow-xl transition hover:-translate-y-1">
          <div className="inline-flex rounded-full bg-destructive px-3 py-1 text-xs font-bold uppercase tracking-widest text-destructive-foreground">🔥 Next event</div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl uppercase text-destructive break-words">🎾 Tournament – Saturday 30 January 2027</h2>
          <ul className="mt-4 grid gap-1.5 text-base sm:text-lg">
            <li>🕐 15:00 – 18:00 (Berlin time) · one 3-hour block</li>
            <li>👥 Minimum 16 players – Maximum 24 players · open to every level</li>
            <li>💪 Lots of drills in 4 or 6-player teams · 🎁 gift for the winners · 🎶 music + 🍿 snacks</li>
            <li>💰 €25 per player · €18 for Urban Sports Club and Wellhub members</li>
          </ul>
          <span className="mt-5 inline-flex min-h-12 items-center rounded-full bg-destructive px-6 text-lg font-bold text-destructive-foreground">Join the Tournament →</span>
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          <article className="group relative p-6 sm:p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-4 -right-2 sm:-right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-pink grid place-items-center text-2xl sm:text-3xl shadow-lg">🏆</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Hobby League</div>
            <h2 className="text-2xl sm:text-3xl mb-3 break-words pr-12">Single hobby tournament</h2>
            <p className="text-muted-foreground mb-6">
              A friendly singles tournament for hobby players who love the thrill of match play
              without the pressure of official rankings. Short-format matches, balanced brackets by level,
              and a chill Berlin vibe.
            </p>
            <p className="text-sm font-semibold text-muted-foreground">3h event</p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> Balanced brackets, all levels welcome</li>
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> Short-format matches</li>
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> Weekend afternoons</li>
            </ul>
          </article>

          <article className="group relative p-6 sm:p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-4 -right-2 sm:-right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ball grid place-items-center text-2xl sm:text-3xl shadow-lg">💑</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Mixed Doubles</div>
            <h2 className="text-2xl sm:text-3xl mb-3 break-words pr-12">Double mixt tournament</h2>
            <p className="text-muted-foreground mb-6">
              A fun, social mixed-doubles event where levels are balanced so every match is competitive.
              Rotating partners, music between sets, and a laid-back atmosphere guaranteed.
            </p>
            <p className="text-sm font-semibold text-muted-foreground">3h event</p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> 16–24 players, balanced levels</li>
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> Rotating partners every round</li>
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> Fri &amp; Saturday afternoon or Sunday afternoon</li>
            </ul>
          </article>

          <article className="group relative p-6 sm:p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-4 -right-2 sm:-right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-violet text-violet-foreground grid place-items-center text-2xl sm:text-3xl shadow-lg">💞</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Fun format</div>
            <h2 className="text-2xl sm:text-3xl mb-3 break-words pr-12">Single status against couples tournament</h2>
            <p className="text-muted-foreground mb-6">
              The concept: singles players team up and take on the couples in a friendly, funny
              tournament. Expect teasing, cheering and a great atmosphere on court.
            </p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-violet shrink-0">✓</span> Singles team vs. couples team</li>
              <li className="flex gap-2"><span className="text-violet shrink-0">✓</span> All levels, balanced matches</li>
              <li className="flex gap-2"><span className="text-violet shrink-0">✓</span> Weekend afternoons</li>
            </ul>
          </article>

          <article className="group relative p-6 sm:p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-4 -right-2 sm:-right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-clay text-background grid place-items-center text-2xl sm:text-3xl shadow-lg">☀️</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Summer Camp 2026</div>
            <h2 className="text-2xl sm:text-3xl mb-4 break-words pr-12">Summer Camp 2026</h2>

            <ul className="space-y-1.5 text-base text-muted-foreground">
              <li>📅 Aug 17 + 18 + 20</li>
              <li>🕕 6:30–8:30 PM</li>
              <li>👥 Groups of 4–6 players</li>
              <li>🎯 Footwork • Tactics • Technique</li>
              <li>🗣️ English / French</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
