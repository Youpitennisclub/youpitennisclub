import { PARTNER_DISCOUNT, ratesFor } from "@/lib/prices";
import { createFileRoute, Link } from "@tanstack/react-router";

import posterAsset from "@/assets/youpi-court.jpg.asset.json";
import wellhubLogoAsset from "@/assets/wellhub-logo.png.asset.json";
import urbanSportsClubLogoAsset from "@/assets/urban-sports-club-logo.png.asset.json";
import { FeedbackSection } from "@/components/FeedbackSection";
import { SiteHeader } from "@/components/SiteHeader";

const SITE = "https://youpitennisclub.com";
const OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b0e94463-7995-4710-9e4d-a291721f56ed";
const TITLE = "Tennis Lessons in Berlin (English) — Youpi Tennis Club";
const DESCRIPTION =
  "Tennis lessons in Berlin in English, French and German: private, duo and small-group coaching on clay courts in Reinickendorf, plus social tennis events. Book online.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SportsActivityLocation",
          name: "Youpi Tennis Club",
          description: DESCRIPTION,
          url: `${SITE}/`,
          image: OG_IMAGE,
          telephone: "+4917645689622",
          email: "youpitennisclub@gmail.com",
          priceRange: "€€",
          currenciesAccepted: "EUR",
          paymentAccepted: "PayPal, SEPA, Cash",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Ollenhauerstr. 64e",
            postalCode: "13403",
            addressLocality: "Berlin",
            addressCountry: "DE",
          },
          areaServed: { "@type": "City", name: "Berlin" },
          sport: "Tennis",
          availableLanguage: ["English", "French", "German"],
          makesOffer: [
            { "@type": "Offer", name: "Private tennis lesson (90 min)", priceCurrency: "EUR", price: "50" },
            { "@type": "Offer", name: "Duo tennis lesson (90 min)", priceCurrency: "EUR", price: "25" },
            { "@type": "Offer", name: "Group tennis lesson (90 min)", priceCurrency: "EUR", price: "19" },
          ],
        }),
      },
    ],
  }),
  component: Index,
});


const FLAGS = ["🇫🇷", "🇩🇪", "🇺🇸", "🇹🇷", "🇺🇦", "🇪🇸", "🇮🇹", "🇧🇷", "🇯🇵", "🇲🇽", "🇵🇱", "🇪🇬", "🇱🇧", "🇷🇺", "🇬🇷", "🇬🇧", "🇨🇳", "🇸🇪", "🇰🇷", "🇮🇳"];

function Index() {
  return (

    <main className="relative overflow-hidden text-left">
      <SiteHeader />

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-6 pt-6 pb-8">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 relative z-10">
            <h1 className="text-[clamp(2.25rem,9vw,5.5rem)] font-display uppercase break-words">
              Tennis<br />
              <span className="text-clay">without</span><br />
              borders
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/book" className="px-6 sm:px-7 py-4 rounded-full bg-violet text-violet-foreground font-semibold hover:opacity-90 transition">
                Book your lesson 🎾
              </Link>
              <a href="#lessons" className="px-6 sm:px-7 py-4 rounded-full border-2 border-ink/15 font-semibold hover:border-clay hover:text-clay transition">
                See lessons →
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-2 text-xl sm:text-2xl">
                {FLAGS.slice(0, 6).map((f) => (
                  <span key={f} className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-background border-2 border-background shadow-md grid place-items-center">{f}</span>
                ))}
              </div>
              <div className="min-w-0">
                <div className="font-display text-2xl">+200</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">players · 40 nationalities</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative self-end">
            <div className="relative rounded-3xl overflow-hidden max-w-sm lg:max-w-md ml-auto">
              <img src={posterAsset.url} alt="Youpi, tennis coach in Berlin, smiling on a clay court" className="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>

      {/* WINTER SEASON */}
      <section id="pricing" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="rounded-[2rem] bg-clay text-ink p-4 sm:p-10 md:p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-ball opacity-35 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-background opacity-30 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span translate="no" className="notranslate inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ink text-background border border-ink text-sm font-semibold">
                Wintersaison
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/85 text-ink border border-background/70 text-sm font-semibold">
                Indoor
              </span>
            </div>

            <h2 className="text-[min(6.2vw,3.75rem)] font-display uppercase tracking-tight mb-6">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                Winter schedule
                <span aria-hidden="true" className="shrink-0 leading-none text-[0.85em]">🥶</span>
              </span>
            </h2>




            <div className="rounded-2xl bg-background text-ink border-2 border-ink/10 p-6">
              <h3 className="font-display text-xl uppercase mb-4">🎾 How Winter Groups Work</h3>
              <ol className="grid gap-4">
                <li className="min-w-0">
                  <div className="flex items-baseline gap-2 font-display text-base sm:text-lg uppercase text-clay">
                    <span className="shrink-0">1.</span>
                    <span className="min-w-0 break-words">Pick your level &amp; schedule</span>
                  </div>
                  <p className="mt-1 pl-7 text-sm sm:text-base text-ink/75">
                    Choose your preferred time slot and skill level.
                  </p>
                </li>
                <li className="min-w-0">
                  <div className="flex items-baseline gap-2 font-display text-base sm:text-lg uppercase text-clay">
                    <span className="shrink-0">2.</span>
                    <span className="min-w-0 break-words">We match you up</span>
                  </div>
                  <p className="mt-1 pl-7 text-sm sm:text-base text-ink/75">
                    No partner needed! We organize the groups based on court availability:
                  </p>
                  <ul className="mt-2 pl-7 space-y-1.5 text-sm sm:text-base text-ink/80">
                    <li className="flex gap-2">
                      <span aria-hidden="true">•</span>
                      <span className="min-w-0 break-words"><span className="font-semibold text-ink">Weekdays (before 4 PM)</span>: Sessions run with 2 to 4 players.</span>
                    </li>
                    <li className="flex gap-2">
                      <span aria-hidden="true">•</span>
                      <span className="min-w-0 break-words"><span className="font-semibold text-ink">Evenings &amp; Weekends</span>: Sessions confirm as soon as 4 players join.</span>
                    </li>
                  </ul>
                </li>
                <li className="min-w-0">
                  <div className="flex items-baseline gap-2 font-display text-base sm:text-lg uppercase text-clay">
                    <span className="shrink-0">3.</span>
                    <span className="min-w-0 break-words">Get ready to play!</span>
                  </div>
                  <p className="mt-1 pl-7 text-sm sm:text-base text-ink/75">
                    We lock in your slot and send the training details as soon as your group is ready (at least 24h before).
                  </p>
                </li>
              </ol>
            </div>

            <article className="mx-auto mt-6 w-full max-w-md md:max-w-lg lg:w-fit lg:max-w-4xl rounded-2xl bg-background text-ink py-4 md:py-5 lg:py-6 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:px-[max(1.25rem,env(safe-area-inset-left))] md:pr-[max(1.25rem,env(safe-area-inset-right))] lg:px-[max(1.5rem,env(safe-area-inset-left))] lg:pr-[max(1.5rem,env(safe-area-inset-right))] border-2 border-pink/40">
              <div className="flex flex-col gap-2 md:gap-3 lg:flex-row lg:items-center lg:gap-6">
                <div className="mx-auto grid w-fit max-w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-xl border border-ink/10 bg-ball/40 px-2.5 py-2 md:gap-3 md:px-3.5 md:py-3 lg:mx-0 lg:w-auto lg:gap-4 lg:px-5 lg:py-4">
                  <img
                    src={wellhubLogoAsset.url}
                    alt="Wellhub"
                    className="h-8 w-full min-w-0 object-contain md:h-10 md:max-w-[9rem] lg:h-12 lg:max-w-[10rem]"
                  />
                  <span className="shrink-0 font-display text-lg uppercase text-clay md:text-xl">+</span>
                  <img
                    src={urbanSportsClubLogoAsset.url}
                    alt="Urban Sports Club"
                    className="h-9 w-full min-w-0 object-contain md:h-11 md:max-w-[10rem] lg:h-14 lg:max-w-[11rem]"
                  />
                </div>
                <div className="min-w-0 text-center lg:text-left">
                  <div className="font-display text-sm uppercase text-clay break-words md:text-base lg:text-lg">
                    €{PARTNER_DISCOUNT} off every tennis session <span aria-hidden="true">🎾</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/70 break-words md:text-[13px] lg:whitespace-nowrap">
                    For members with a Classic plan or higher — max. 4 sessions/month.
                  </p>
                  <div className="mt-1.5 inline-flex items-center rounded-full border border-destructive/25 bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-destructive">
                    From 15 October 2026
                  </div>
                </div>
              </div>
            </article>

            <Link to="/book" className="block text-center mt-6 px-7 py-4 rounded-full bg-ink text-background font-semibold hover:opacity-90 transition">
              Book Your Winter Season →
            </Link>
          </div>
        </div>
      </section>

      {/* LESSONS */}
      <section id="lessons" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <h2 className="text-[clamp(1.75rem,7vw,3.75rem)] font-display uppercase max-w-2xl mb-6 break-words">
          Pick your <span className="text-clay">game</span>
        </h2>

        <p className="text-muted-foreground mb-6 max-w-2xl">
          Winter season bookings are open! Group sessions of 1 hour — price per person, depending on the club, the time and the group size.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {([
            { venue: "alemannia", club: "BFC Alemannia", hour: 10, color: "bg-navy", icon: "☀️" },
            { venue: "alemannia", club: "BFC Alemannia", hour: 17, color: "bg-navy", icon: "🌙" },
          ] as const).map((l) => {
            const r = ratesFor(l.venue, l.hour);
            return (
              <article key={l.club + l.hour} className="relative min-w-0 p-6 sm:p-7 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition">
                <div className={`absolute -top-4 -right-2 sm:-right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full ${l.color} grid place-items-center text-2xl sm:text-3xl shadow-lg`}>
                  {l.icon}
                </div>
                <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Group · 60 min</div>
                <h3 className="text-2xl sm:text-3xl mb-1 break-words pr-12">{l.club}</h3>
                <p className="text-muted-foreground mb-4">{r.period}</p>
                <ul className="rounded-2xl bg-ball/30 border-2 border-ink/10 p-4 space-y-1.5">
                  {r.rates.map((x) => (
                    <li key={x.n} className="flex justify-between gap-3 text-sm">
                      <span className="text-ink/70 font-medium">{x.n}</span>
                      <span className="font-display text-ink shrink-0">{x.p} / pers</span>
                    </li>
                  ))}
                </ul>
                {r.nonMemberExtra > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">Non-members: +€{r.nonMemberExtra} per person</p>
                )}
              </article>
            );
          })}
        </div>

        {/* TC Longline — Friday only, compact */}
        <aside className="mt-6 rounded-2xl border-2 border-clay/35 bg-clay/5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-clay shrink-0" aria-hidden="true" />
            <h3 className="font-display text-base sm:text-lg uppercase text-ink break-words">TC Longline · Fridays only</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([10, 17] as const).map((h) => {
              const r = ratesFor("longline", h);
              return (
                <div key={h} className="min-w-0 rounded-xl bg-background border border-ink/10 px-3 py-2.5">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-clay">{r.period}</div>
                  <ul className="mt-1.5 space-y-1">
                    {r.rates.map((x) => (
                      <li key={x.n} className="flex justify-between gap-3 text-sm">
                        <span className="text-ink/70 font-medium">{x.n}</span>
                        <span className="font-display text-ink shrink-0">{x.p} / pers</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>
      </section>


      {/* MANIFESTO */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="grid min-w-0 md:grid-cols-2 gap-8 items-start">
          <div className="min-w-0 max-w-full overflow-visible">
            <h2 className="max-w-full text-[clamp(1.7rem,7vw,3.25rem)] font-display uppercase leading-[1.05] mb-5 break-words">
              No place in a club?<br/>
              <span className="text-clay">Tired of ball-feeders?</span>
            </h2>
            <p className="max-w-full text-muted-foreground text-base leading-relaxed sm:text-lg mb-4 break-words">
              <strong>No place in a Berlin tennis club?</strong> Tired of coaches who just{" "}
              <strong>feed balls</strong> and rarely correct your technique? Whether you want to{" "}
              <strong>learn tennis from scratch</strong> or <strong>take your game to the next level</strong>{" "}
              with a passionate and dedicated coach — I'm here for it. 💪🎾
            </p>
            <p className="max-w-full text-muted-foreground text-base leading-relaxed sm:text-lg mb-4 break-words">
              🌍 Join our <strong>multicultural tennis classes</strong> and meet students from all over the
              world in a fun, friendly and supportive atmosphere.
            </p>
            <p className="max-w-full text-muted-foreground text-base leading-relaxed sm:text-lg mb-4 break-words">
              🗣️ I speak fluent <strong>English, French &amp; German</strong>, so players from every
              background feel at home on court.
            </p>
            <p className="max-w-full text-muted-foreground text-base leading-relaxed sm:text-lg mb-4 break-words">
              💡 <strong>Technique</strong>, <strong>motivation</strong> and a real{" "}
              <strong>coach–student connection</strong> are the keys to real progress and to
              actually enjoying the game.
            </p>
            <p className="max-w-full text-muted-foreground text-base leading-relaxed sm:text-lg mb-6 break-words">
              👫 <strong>Want to train with your partner or with your friends?</strong><br/>
              I can build a group just for you. And I really take care of putting players together by level, so
              everyone enjoys the session — something most coaches simply don't do.
            </p>
            <p className="max-w-full font-display text-xl sm:text-3xl md:text-4xl uppercase leading-tight text-clay break-words">
              Student satisfaction is what matters most to me.
            </p>
          </div>
          <div className="min-w-0 max-w-full space-y-4 overflow-visible">
            {[
              { i: "🎾", t: "Personalized coaching", d: "Every session is built around your level, your goals, and the parts of your game you actually want to fix." },
              { i: "🌍", t: "Truly multicultural", d: "Berlin's international crowd on one court — new friends, new rally partners, zero cliques." },
              { i: "💬", t: "Two-way process", d: "Great coaching is a conversation. Tell me what works, what doesn't, and we adjust." },
              { i: "🔥", t: "Passion first", d: "I left law for this. Expect energy, focus and a coach who actually cares if you improve." },
            ].map((x) => (
              <div key={x.t} className="grid min-w-0 max-w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-3 overflow-visible rounded-2xl border-2 border-ink/10 bg-card p-4 transition hover:border-ink sm:gap-4 sm:p-5">
                <div className="shrink-0 text-2xl sm:text-3xl">{x.i}</div>
                <div className="min-w-0 max-w-full overflow-visible whitespace-normal [&_span]:whitespace-normal">
                  <div className="max-w-full whitespace-normal break-words font-display text-base uppercase leading-tight sm:text-xl mb-2">{x.t}</div>
                  <div className="max-w-full whitespace-normal break-words text-sm leading-relaxed text-muted-foreground">{x.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <h2 className="text-3xl sm:text-4xl font-display uppercase mb-8">FAQ</h2>
        <div className="divide-y divide-border border-y border-border">
          {[
            { q: "Where do we play?", a: "Summer season: BFC Alemannia Tennis Club — Ollenhauerstr. 64e, 13403 Berlin (clay courts). Winter season: TC Longline, with possible extra slots at TCW and Sportcenter Wittenau." },
            { q: "I don't speak German. Is that ok?", a: "Absolutely — most of our community is international. Lessons run in English by default." },
            { q: "Do I need my own racket?", a: "No — but you can rent a racket for €2 per session." },
            { q: "How do I pay?", a: "PayPal, SEPA or cash on court. Packs are non-refundable but transferable." },
          ].map((f) => (
            <details key={f.q} className="group py-6 cursor-pointer">
              <summary className="flex items-start justify-between gap-4 font-display text-lg sm:text-xl uppercase list-none">
                <span className="min-w-0 break-words">{f.q}</span>
                <span className="text-clay text-3xl shrink-0 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FEEDBACK */}
      <FeedbackSection />

      {/* FOOTER */}
      <footer className="bg-ink text-background mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div translate="no" className="notranslate font-display text-xl sm:text-2xl uppercase">Youpi Tennis Club</div>
          <div className="flex flex-wrap gap-6 text-sm text-background/70">
            <Link to="/contact" className="hover:text-ball transition">Contact</Link>
            <Link to="/privacy" className="hover:text-ball transition">Privacy</Link>
            <Link to="/cookies" className="hover:text-ball transition">Cookies</Link>
          </div>
        </div>
        <div className="border-t border-background/10 py-5 text-xs text-background/40 px-6 max-w-7xl mx-auto">
          © {new Date().getFullYear()} Youpi Tennis Club · Made with 🎾 in Berlin
        </div>
      </footer>

    </main>

  );
}
