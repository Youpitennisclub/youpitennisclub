import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const TITLE = "Past Tennis Events Berlin — Youpi Tennis Club";
const DESCRIPTION = "A look back at Youpi Tennis Club events in Berlin, including Summer Camp 2026.";

export const Route = createFileRoute("/past-events")({
  head: () => ({ meta: [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PastEventsPage,
});

function PastEventsPage() {
  return <main className="min-h-screen text-left">
    <SiteHeader />
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-clay">Community archive</p>
      <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] uppercase leading-none">Past events</h1>
      <article className="mt-10 border-l-4 border-clay bg-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-clay">August 17, 18 &amp; 20 · 2026</p>
        <h2 className="mt-3 font-display text-3xl uppercase">Summer Camp 2026</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">Three two-hour sessions with two coaches, bringing together groups of 4 to 6 players matched by level for focused work on footwork, tactics and technique.</p>
        <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-border pt-5 text-center">
          <div><dt className="font-display text-3xl">3</dt><dd className="text-xs text-muted-foreground">sessions</dd></div>
          <div><dt className="font-display text-3xl">2h</dt><dd className="text-xs text-muted-foreground">each day</dd></div>
          <div><dt className="font-display text-3xl">2</dt><dd className="text-xs text-muted-foreground">coaches</dd></div>
        </dl>
      </article>
    </section>
    <SiteFooter />
  </main>;
}