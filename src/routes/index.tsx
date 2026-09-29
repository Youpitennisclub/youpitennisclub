import { ratesFor } from "@/lib/prices";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

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
          email: "chaouchyoucef@yahoo.com",
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
  const [contactOpen, setContactOpen] = useState(false);
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

      {/* LESSONS */}
      <section id="lessons" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <h2 className="text-[clamp(1.75rem,7vw,3.75rem)] font-display uppercase max-w-2xl mb-6 break-words">
          Pick your <span className="text-court">game</span>
        </h2>

        <p className="text-muted-foreground mb-6 max-w-2xl">
          Winter season bookings are open! Group sessions of 1 hour — price per person, depending on the club, the time and the group size.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {([
            { venue: "alemannia", club: "BFC Alemannia", hour: 10, color: "bg-navy", icon: "☀️" },
            { venue: "alemannia", club: "BFC Alemannia", hour: 17, color: "bg-navy", icon: "🌙" },
            { venue: "longline", club: "TC Longline", hour: 10, color: "bg-court", icon: "☀️" },
            { venue: "longline", club: "TC Longline", hour: 17, color: "bg-court", icon: "🌙" },
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
      </section>

      {/* EVENTS */}
      <section id="events" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <h2 translate="no" className="notranslate text-[clamp(1.75rem,7vw,3.75rem)] font-display uppercase mb-3 break-words">
          Tennis <span className="text-pink">&amp; Social</span>
        </h2>

        <p className="text-muted-foreground max-w-2xl mb-6">
          Meet people, network, and have fun. Relaxed formats designed for Berliners who want to play and connect.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <article className="group relative p-6 sm:p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-4 -right-2 sm:-right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-pink grid place-items-center text-2xl sm:text-3xl shadow-lg">🏆</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Hobby League</div>
            <h3 className="text-2xl sm:text-3xl mb-3 break-words pr-12">Single hobby tournament</h3>
            <p className="text-muted-foreground mb-6">
              A friendly singles tournament for hobby players who love the thrill of match play
              without the pressure of official rankings. Short-format matches, balanced brackets by level,
              and a chill Berlin vibe.
            </p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl">€25</span>
              <span className="text-sm text-muted-foreground">/ pers · 4h event</span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> Balanced brackets, all levels welcome</li>
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> Short-format matches</li>
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> Weekend afternoons</li>
            </ul>
          </article>

          <article className="group relative p-6 sm:p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-4 -right-2 sm:-right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ball grid place-items-center text-2xl sm:text-3xl shadow-lg">💑</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Mixed Doubles</div>
            <h3 className="text-2xl sm:text-3xl mb-3 break-words pr-12">Double mixt tournament</h3>
            <p className="text-muted-foreground mb-6">
              A fun, social mixed-doubles event where levels are balanced so every match is competitive.
              Rotating partners, music between sets, and a laid-back atmosphere guaranteed.
            </p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl">€25</span>
              <span className="text-sm text-muted-foreground">/ pers · 4h event</span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> 16–24 players, balanced levels</li>
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> Rotating partners every round</li>
              <li className="flex gap-2"><span className="text-ball shrink-0">✓</span> Fri &amp; Saturday afternoon or Sunday afternoon</li>
            </ul>
          </article>

          <article className="group relative p-6 sm:p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-4 -right-2 sm:-right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-violet text-violet-foreground grid place-items-center text-2xl sm:text-3xl shadow-lg">💞</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Fun format</div>
            <h3 className="text-2xl sm:text-3xl mb-3 break-words pr-12">Single status against couples tournament</h3>
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
            <h3 className="text-2xl sm:text-3xl mb-4 break-words pr-12">Summer Camp 2026</h3>

            <ul className="space-y-1.5 text-base text-muted-foreground">
              <li>📅 Aug 17 + 18 + 20</li>
              <li>🕕 6:30–8:30 PM</li>
              <li>👥 Groups of 4–6 players</li>
              <li>🎯 Footwork • Tactics • Technique</li>
              <li>🗣️ English / French</li>
            </ul>
            <p className="mt-4 font-display text-2xl sm:text-3xl">
              💸 €100–150
            </p>
            <p className="text-sm text-muted-foreground">depending on group size &amp; membership</p>
          </article>
        </div>
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

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="rounded-3xl bg-brick text-background p-5 sm:p-8 md:p-10">
          <h2 className="text-[clamp(1.7rem,7vw,3.25rem)] font-display uppercase mb-6 break-words">
            How it works
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { i: "🎾", t: "90-min group sessions", d: "From 3 players — plenty of time for drills, tactics and point play." },
              { i: "👥", t: "Only 2 registered?", d: "The session runs 60 min instead of 90." },
              { i: "⏰", t: "Cancellation", d: "Less than 24h before the session, the full fee is charged." },
              { i: "🌧️", t: "Rain policy", d: "More than 50% played → no refund. Less than 50% → full refund or reschedule, your call." },
            ].map((r) => (
              <div key={r.t} className="rounded-2xl bg-background text-ink p-5 sm:p-6 md:p-7">
                <div className="text-3xl mb-2">{r.i}</div>
                <div className="font-display text-xl sm:text-2xl md:text-3xl uppercase mb-2 break-words">{r.t}</div>
                <p className="text-base md:text-lg text-ink/80">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WINTER SEASON */}
      <section id="pricing" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="rounded-[2rem] bg-navy text-background p-5 sm:p-10 md:p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-sky opacity-30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-violet opacity-20 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span translate="no" className="notranslate inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky/20 text-sky border border-sky/30 text-sm font-semibold">
                Wintersaison
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet/20 text-violet-foreground border border-violet/30 text-sm font-semibold">
                Indoor
              </span>
            </div>

            <h2 className="text-[clamp(1.75rem,7vw,3.75rem)] font-display uppercase break-words mb-6">
              Winter schedule 🥶
            </h2>

            <div className="grid lg:grid-cols-2 gap-5 mb-8">
              <article className="rounded-2xl bg-background text-ink p-6 border-2 border-sky/30">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-full bg-sky text-background grid place-items-center text-xl shrink-0">❄️</span>
                  <h3 translate="no" className="notranslate font-display text-xl uppercase">TC Longline</h3>
                </div>
                <div className="space-y-2">
                  <div translate="no" className="notranslate text-2xl font-display text-sky">Fr · 11–17 Uhr</div>
                </div>
                <p className="text-sm text-ink/70 mt-3">Friday indoor at TC Longline.</p>
                <p className="mt-4 rounded-xl bg-sky/15 p-3 text-sm text-ink/80">
                  Flexible with work? You can book a weekday court at TC Longline on Friday between
                  <strong> 11:00 and 15:00</strong> in a group of two students — from 15:00, groups of four.
                </p>
              </article>

              <article className="rounded-2xl bg-background text-ink p-6 border-2 border-violet/30">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-full bg-violet text-violet-foreground grid place-items-center text-xl shrink-0">🏠</span>
                  <h3 translate="no" className="notranslate font-display text-xl uppercase">BFC Alemannia</h3>
                </div>
                <div className="space-y-2">
                  <div translate="no" className="notranslate text-2xl font-display text-violet">Mo · Di · Do · Fr · 20–22 Uhr</div>
                  <div translate="no" className="notranslate text-2xl font-display text-violet">Sa · 09–11 Uhr &amp; 13–15 Uhr</div>
                </div>
                <p className="text-sm text-ink/70 mt-3">Weekday evenings + Saturday morning &amp; afternoon at our home base.</p>
              </article>
            </div>

            <div className="rounded-2xl bg-background/10 border-2 border-background/20 p-6">
              <h3 className="font-display text-xl uppercase mb-3">How winter groups work</h3>
              <p className="text-background/80 mb-4">
                Pick several spots that interest you. I build the groups based on level, availability and preferences, then confirm the final details.
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-background/90">
                <li className="flex gap-2"><span className="text-sky">✓</span> Groups of 4–6 students</li>
                <li className="flex gap-2"><span className="text-sky">✓</span> Final day &amp; time</li>
                <li className="flex gap-2"><span className="text-sky">✓</span> 60 min or 90 min training</li>
                <li className="flex gap-2"><span className="text-sky">✓</span> Based on your wishes &amp; availability</li>
              </ul>
              <p className="mt-4 text-sm text-background/70">
                Winter season bookings are open — see the prices per club and time in “Pick your game”.
              </p>
            </div>

            <article className="rounded-2xl bg-background text-ink p-6 border-2 border-pink/40 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:w-auto sm:gap-3">
                  <img
                    src={wellhubLogoAsset.url}
                    alt="Wellhub"
                    className="h-7 w-full min-w-0 object-contain sm:h-8 sm:max-w-[8rem]"
                  />
                  <span className="text-lg font-display uppercase text-ink">+</span>
                  <img
                    src={urbanSportsClubLogoAsset.url}
                    alt="Urban Sports Club"
                    className="h-9 w-full min-w-0 object-contain sm:h-10 sm:max-w-[9rem]"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-2xl sm:text-3xl uppercase text-destructive mb-1">Coming soon</div>
                  <p className="text-sm text-ink/80">
                    Partnership with Urban Sport for a nice discount on your tennis lessons 😉
                  </p>
                </div>
              </div>
            </article>

            <Link to="/book" className="block text-center mt-6 px-7 py-4 rounded-full bg-violet text-violet-foreground font-semibold hover:opacity-90 transition">
              Book Your Winter Season →
            </Link>
          </div>
        </div>
      </section>

      {/* BOOK CTA */}
      <section id="book" className="max-w-4xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="relative rounded-3xl bg-navy text-background overflow-hidden p-5 sm:p-10 md:p-12">
          <div className="absolute -bottom-14 -left-14 w-52 h-52 rounded-full bg-sky/30 blur-2xl" />
          <div className="relative">
            <h2 className="text-[clamp(1.7rem,7vw,3.5rem)] font-display uppercase mb-5 break-words">
              Ready? Los geht's
            </h2>
            <p className="text-background/75 text-lg mb-8 max-w-xl">
              Pick your slot, choose your level, and lock it in. Instant confirmation — no
              back-and-forth.
            </p>
            <Link
              to="/book"
              className="inline-block px-8 sm:px-10 py-5 rounded-full bg-violet text-violet-foreground font-semibold text-lg sm:text-xl hover:opacity-90 transition shadow-xl"
            >
              Book your lesson 🎾
            </Link>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="inline-block px-8 sm:px-10 py-4 rounded-full border-2 border-background/40 text-background font-semibold text-base sm:text-lg hover:bg-background/10 transition"
              >
                Contact me 📩
              </button>
            </div>

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
