import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const TITLE = "Tennis Club Membership Berlin — Youpi Tennis Club";
const DESCRIPTION = "BFC Alemannia membership information, introductory rates and outdoor clay-court access in Berlin.";

export const Route = createFileRoute("/membership")({
  head: () => ({ meta: [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: MembershipPage,
});

function MembershipPage() {
  return <main className="min-h-screen text-left">
    <SiteHeader />
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-clay">BFC Alemannia Tennis Club</p>
      <h1 className="max-w-3xl font-display text-[clamp(2.5rem,8vw,5rem)] uppercase leading-none">Club membership</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Join a friendly Berlin club with six clay courts and real court availability throughout the outdoor season.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="border-l-4 border-clay bg-card p-6">
          <h2 className="font-display text-2xl uppercase">First year</h2>
          <p className="mt-1 text-sm text-muted-foreground">Introductory rate from July 2026</p>
          <div className="mt-6 flex items-end justify-between border-t border-border pt-4"><span>Single</span><strong className="font-display text-4xl">€80</strong></div>
        </article>
        <article className="border-l-4 border-navy bg-card p-6">
          <h2 className="font-display text-2xl uppercase">From year 2</h2>
          <dl className="mt-5 space-y-3">
            <div className="flex justify-between gap-4"><dt>Single</dt><dd className="font-display text-xl">€320</dd></div>
            <div className="flex justify-between gap-4"><dt>Couple</dt><dd className="font-display text-xl">€580</dd></div>
            <div className="flex justify-between gap-4"><dt>Member of another Berlin club</dt><dd className="font-display text-xl">€160</dd></div>
          </dl>
        </article>
      </div>
      <div className="mt-8 border-y border-border py-6">
        <h2 className="font-display text-2xl uppercase">Try before you join</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Attend 2–3 training sessions before becoming a member. Meet the group, discover the club and decide afterwards.</p>
      </div>
      <Link to="/contact" className="mt-8 inline-flex rounded-md bg-violet px-6 py-3 font-semibold text-violet-foreground">Ask about membership</Link>
    </section>
    <SiteFooter />
  </main>;
}