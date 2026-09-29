import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";

const TITLE = "Tennis Club Membership in Berlin — Youpi Tennis Club";
const DESCRIPTION =
  "Membership information for BFC Alemannia Tennis Club in Berlin, including first-year rates and unlimited outdoor clay-court access.";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://youpitennisclub.com/membership" }],
  }),
  component: MembershipPage,
});

function MembershipPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10 text-left sm:px-6 sm:py-16">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay">Club membership</p>
          <h1 className="mb-5 text-4xl font-display uppercase break-words sm:text-6xl">
            BFC Alemannia <span className="text-clay">Tennis Club</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Our summer home in Berlin: outdoor clay courts until October, then indoor training for the winter season.
          </p>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-relaxed text-ink sm:text-xl">
            You want to be a new member of a familiar, beautiful tennis club with open-minded people and a good club
            restaurant, <span className="text-clay">right in the middle of Berlin nature</span>?
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3 text-ink">
            <div className="flex gap-3"><span className="shrink-0">📍</span><span>Ollenhauerstr. 64e, 13403 Berlin</span></div>
            <div className="flex gap-3"><span className="shrink-0">🚉</span><span>4 min walk from U8 Lindauer Allee &amp; S25 Karl-Bonhoeffer-Nervenklinik — <strong>easy from all of Berlin</strong></span></div>
            <div className="flex gap-3"><span className="shrink-0">🎾</span><span>Only ~180 members for 6 clay courts (+ 2 in renovation) = <strong>real court availability in the evening after work</strong></span></div>
            <div className="flex gap-3"><span className="shrink-0">🥶</span><span>Winter coaching at <strong>TC Longline</strong> and <strong>BFC Alemannia</strong></span></div>

            <div className="mt-7 rounded-md border-2 border-ink bg-ball/40 p-5">
              <h2 className="mb-2 text-xl font-display uppercase">Try before you join</h2>
              <p className="text-sm text-ink/80">
                Attend <strong>2–3 training sessions</strong> before becoming a member. Discover the club, meet the crew, then decide.
              </p>
            </div>
          </div>

          <div>
            <div className="rounded-md border-2 border-ink/10 bg-card p-5 sm:p-6">
              <h2 className="mb-3 text-lg font-display uppercase">Intro rates · First year <span className="text-sm normal-case text-muted-foreground">(from April 2027)</span></h2>
              <div className="flex justify-between gap-3 py-1.5"><span>Single</span><span className="shrink-0 text-xl font-display">€160</span></div>
              <div className="mb-3 border-b-2 border-ink/10 pb-3" />
              <h2 className="mb-3 text-lg font-display uppercase">From year 2</h2>
              <div className="flex justify-between gap-3 py-1.5"><span>Single</span><span className="shrink-0 text-xl font-display">€320</span></div>
              <div className="flex justify-between gap-3 py-1.5"><span>Couple</span><span className="shrink-0 text-xl font-display">€580</span></div>
              <div className="flex justify-between gap-3 py-1.5"><span>Member of another Berlin club</span><span className="shrink-0 text-xl font-display">€160</span></div>
            </div>
            <div className="mt-5 rounded-md border-2 border-ink bg-court p-5 text-primary-foreground">
              <h2 className="mb-2 text-xl font-display uppercase sm:text-2xl">Unlimited outdoor access</h2>
              <p className="text-sm">
                Membership gives you <strong>unlimited access to the outdoor clay courts</strong> to play with other members whenever you like, all summer long.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/book" className="rounded-full bg-violet px-7 py-4 font-semibold text-violet-foreground">Book your lesson</Link>
          <Link to="/contact" className="rounded-full border-2 border-ink/15 px-7 py-4 font-semibold transition hover:border-clay hover:text-clay">Contact me</Link>
        </div>
      </section>
    </main>
  );
}