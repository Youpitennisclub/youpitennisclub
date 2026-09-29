import { ratesFor } from "@/lib/prices";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import posterAsset from "@/assets/youpi-court.jpg.asset.json";
import { FeedbackSection } from "@/components/FeedbackSection";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";

const SITE = "https://youpitennisclub.com";
const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b0e94463-7995-4710-9e4d-a291721f56ed";
const TITLE = "Winter Tennis Lessons Berlin — Youpi Tennis Club";
const DESCRIPTION = "Book winter tennis lessons at BFC Alemannia and TC Longline in Berlin. Clear schedules and group prices for the 2026–2027 indoor season.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE }, { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE }, { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" }, { property: "og:url", content: `${SITE}/` },
      { property: "og:image", content: OG_IMAGE }, { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
  }),
  component: Index,
});

const venues = [
  { venue: "alemannia", name: "BFC Alemannia", dot: "bg-navy", schedule: ["Mon · 13:00–16:00", "Tue · 12:00–15:00", "Wed · 14:00–17:00", "Thu · 12:00–15:00", "Sat · 09:00–11:00 & 13:00–15:00"] },
  { venue: "longline", name: "TC Longline", dot: "bg-court", schedule: ["Friday · 11:00–17:00"] },
] as const;

function RateList({ venue, hour }: { venue: "alemannia" | "longline"; hour: number }) {
  const prices = ratesFor(venue, hour);
  return <div className="min-w-0 border-t border-border pt-4">
    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{prices.period}</p>
    <ul className="space-y-2">
      {prices.rates.map((rate) => <li key={rate.n} className="flex items-baseline justify-between gap-3 text-sm"><span>{rate.n}</span><strong className="font-display text-lg">{rate.p}</strong></li>)}
    </ul>
    {prices.nonMemberExtra > 0 && <p className="mt-3 text-xs text-muted-foreground">BFC non-members: +€{prices.nonMemberExtra} per person</p>}
  </div>;
}

function Index() {
  const [contactOpen, setContactOpen] = useState(false);
  return <main className="relative min-h-screen overflow-hidden text-left">
    <SiteHeader />

    <section className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-6 sm:pt-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)] lg:items-end">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="border-l-4 border-azure pl-3 text-xs font-bold uppercase tracking-widest text-azure">Winter season 2026–2027</span>
            <span className="text-xs font-semibold text-muted-foreground">7 October → 4 April</span>
          </div>
          <h1 className="max-w-4xl font-display text-[clamp(2.7rem,8vw,6.5rem)] uppercase leading-[.9]">
            Winter tennis<br/><span className="text-clay">in Berlin</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">One-hour group lessons, organised by level at two indoor clubs. Coaching in English, French and German.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/book" className="rounded-md bg-violet px-6 py-4 font-semibold text-violet-foreground transition hover:opacity-90">See available slots</Link>
            <Button variant="outline" size="lg" onClick={() => setContactOpen(true)}>Private lesson</Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground"><strong className="text-ink">Group confirmation:</strong> 2 players before 15:00 on weekdays; 4 players from 15:00 and on weekends.</p>
        </div>
        <div className="relative h-64 overflow-hidden border-b-8 border-clay sm:h-80 lg:h-[25rem]">
          <img src={posterAsset.url} alt="Youpi, tennis coach in Berlin, on a clay court" className="h-full w-full object-cover object-top" />
        </div>
      </div>
    </section>

    <section aria-labelledby="winter-places" className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-clay">Where &amp; when</p><h2 id="winter-places" className="font-display text-[clamp(2rem,6vw,4rem)] uppercase leading-none">Two indoor locations</h2></div>
          <p className="max-w-md text-sm text-muted-foreground">Select the club colour in the calendar: navy for BFC Alemannia, green for TC Longline.</p>
        </div>
        <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          {venues.map((venue) => <article key={venue.name} className="bg-background p-5 sm:p-7">
            <div className="flex items-center gap-3"><span className={`h-4 w-4 shrink-0 rounded-full ${venue.dot}`} /><h3 className="font-display text-2xl uppercase">{venue.name}</h3></div>
            <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">{venue.schedule.map((line) => <li key={line} className="border-l-2 border-border pl-3">{line}</li>)}</ul>
          </article>)}
        </div>
      </div>
    </section>

    <section aria-labelledby="winter-prices" className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
      <div className="mb-7"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-azure">60 minutes · price per person</p><h2 id="winter-prices" className="font-display text-[clamp(2rem,6vw,4rem)] uppercase leading-none">Winter prices</h2></div>
      <div className="grid gap-5 lg:grid-cols-2">
        {venues.map((venue) => <article key={venue.name} className="border-t-4 border-ink bg-card p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3"><span className={`h-4 w-4 rounded-full ${venue.dot}`} /><h3 className="font-display text-2xl uppercase">{venue.name}</h3></div>
          <div className="grid gap-6 sm:grid-cols-2"><RateList venue={venue.venue} hour={10} /><RateList venue={venue.venue} hour={17} /></div>
        </article>)}
      </div>
      <p className="mt-5 max-w-3xl text-sm text-muted-foreground">Groups of 3 students are possible at the prices shown above. Private lessons are available on request and cost more in winter because of indoor court fees.</p>
    </section>

    <section className="bg-navy text-background">
      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div><p className="text-xs font-bold uppercase tracking-widest text-sky">Your coach</p><h2 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Clear coaching. International groups.</h2><p className="mt-3 max-w-3xl text-background/75">I’m Youpi, a French-German lawyer turned full-time tennis coach. Technical progress comes first, with structured sessions in English, French or German and groups matched carefully by level.</p></div>
        <Link to="/book" className="inline-flex justify-center rounded-md bg-clay px-6 py-4 font-semibold text-background transition hover:opacity-90">Book winter tennis</Link>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
      <h2 className="font-display text-3xl uppercase">Essential information</h2>
      <div className="mt-5 grid gap-px border border-border bg-border sm:grid-cols-3">
        <div className="bg-background p-5"><strong className="block font-display text-xl uppercase">Levels</strong><p className="mt-2 text-sm text-muted-foreground">Total beginner, beginner, intermediate and advanced.</p></div>
        <div className="bg-background p-5"><strong className="block font-display text-xl uppercase">Cancellation</strong><p className="mt-2 text-sm text-muted-foreground">Possible until 24 hours before the lesson.</p></div>
        <div className="bg-background p-5"><strong className="block font-display text-xl uppercase">Languages</strong><p className="mt-2 text-sm text-muted-foreground">English, French and German.</p></div>
      </div>
    </section>

    <FeedbackSection />
    <SiteFooter />

    {contactOpen && <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <Button aria-label="Close" variant="ghost" onClick={() => setContactOpen(false)} className="absolute inset-0 h-full w-full rounded-none bg-ink/60 hover:bg-ink/60" />
      <div className="relative z-10 w-full bg-card p-6 shadow-2xl sm:max-w-md sm:border sm:border-border sm:p-8">
        <Button variant="ghost" size="icon" onClick={() => setContactOpen(false)} className="absolute right-3 top-3" aria-label="Close">×</Button>
        <h3 className="pr-10 font-display text-2xl uppercase">Private lesson</h3>
        <p className="mt-3 text-sm text-muted-foreground">Contact me directly for availability and the winter price.</p>
        <div className="mt-6 grid gap-3">
          <a href="https://wa.me/4917645689622" target="_blank" rel="noopener" className="rounded-md bg-violet px-6 py-4 text-center font-semibold text-violet-foreground">WhatsApp · +49 176 45689622</a>
          <a href="mailto:chaouchyoucef@yahoo.com" className="rounded-md border border-border px-6 py-4 text-center font-semibold">Send an email</a>
        </div>
      </div>
    </div>}
  </main>;
}
