import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const TITLE = "Tennis Tournaments in Berlin — Youpi Tennis Club";
const DESCRIPTION = "Friendly singles and mixed doubles tennis tournaments for Berlin's international community.";

export const Route = createFileRoute("/tournaments")({
  head: () => ({ meta: [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: TournamentsPage,
});

const tournaments = [
  { label: "Hobby league", title: "Single hobby tournament", text: "Friendly short-format matches with balanced brackets for hobby players, without the pressure of official rankings.", price: "€25 / person · 4h" },
  { label: "Mixed doubles", title: "Double mixt tournament", text: "Balanced teams, rotating partners, music between sets and a relaxed international atmosphere.", price: "€25 / person · 4h" },
  { label: "Fun format", title: "Single status against couples", text: "Singles players team up and challenge couples in a friendly tournament built around fun, cheering and close matches.", price: "Date and price announced with the event" },
];

function TournamentsPage() {
  return <main className="min-h-screen text-left">
    <SiteHeader />
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-clay">Tennis &amp; Social</p>
      <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] uppercase leading-none">Tournaments</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Social formats for Berliners who want competitive points, balanced levels and new tennis connections.</p>
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {tournaments.map((event, index) => <article key={event.title} className={`border-t-4 ${index === 0 ? "border-clay" : index === 1 ? "border-azure" : "border-pink"} bg-card p-6`}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{event.label}</p>
          <h2 className="mt-3 font-display text-2xl uppercase">{event.title}</h2>
          <p className="mt-4 text-muted-foreground">{event.text}</p>
          <p className="mt-6 border-t border-border pt-4 font-semibold">{event.price}</p>
        </article>)}
      </div>
      <Link to="/contact" className="mt-8 inline-flex rounded-md bg-violet px-6 py-3 font-semibold text-violet-foreground">Ask about the next event</Link>
    </section>
    <SiteFooter />
  </main>;
}