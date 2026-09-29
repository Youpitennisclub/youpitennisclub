import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import posterAsset from "@/assets/youpi-court.jpg.asset.json";
import wellhubLogoAsset from "@/assets/wellhub-logo.png.asset.json";
import urbanSportsClubLogoAsset from "@/assets/urban-sports-club-logo.png.asset.json";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FeedbackSection } from "@/components/FeedbackSection";

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
            { "@type": "Offer", name: "Group tennis lesson (60 min)", priceCurrency: "EUR", price: "24" },
            { "@type": "Offer", name: "Tennis & Social event (4h)", priceCurrency: "EUR", price: "25" },
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
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:flex lg:justify-between">
          <a href="#" className="flex min-w-0 items-center gap-2 font-display text-base sm:text-2xl md:text-3xl uppercase leading-tight">
            <span
              className="inline-block w-7 h-7 shrink-0 rounded-full bg-clay ball-spin shadow-inner"
              style={{ boxShadow: "inset -4px -4px 0 oklch(0.5 0.16 40)" }}
            />
            <span translate="no" className="notranslate min-w-0 break-words">Youpi Tennis Club</span>
          </a>
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            <a href="#offers" className="hover:text-clay transition">Offers</a>
             <a href="#past-events" className="hover:text-clay transition">Past events</a>
            <a href="#club" className="hover:text-clay transition">Club</a>
            <a href="#coach" className="hover:text-clay transition">Coach</a>
            <a href="#faq" className="hover:text-clay transition">FAQ</a>
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link
              to="/book"
              className="hidden sm:inline-block px-4 sm:px-5 py-2.5 rounded-full bg-violet text-violet-foreground text-sm font-semibold hover:opacity-90 transition"
            >
              Book your lesson
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-6 pt-8 pb-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 relative z-10 min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-clay mb-4">Tennis lessons in Berlin · EN · FR · DE</p>
            <h1 className="text-[clamp(2.25rem,8vw,5rem)] font-display uppercase break-words">
              Tennis <span className="text-clay">without borders.</span>
            </h1>
            <p className="mt-4 font-display text-xl sm:text-2xl uppercase leading-tight">Learn, play &amp; connect in Berlin.</p>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-muted-foreground">
              Multicultural tennis lessons in English, French and German. From total beginner to advanced — without the rigidity of traditional clubs.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/book" className="px-7 py-4 rounded-full bg-violet text-violet-foreground font-semibold shadow-lg hover:opacity-90 transition">
                Book your lesson 🎾
              </Link>
              <a href="#offers" className="px-7 py-4 rounded-full border-2 border-ink/15 font-semibold hover:border-clay hover:text-clay transition">
                See offers →
              </a>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden max-w-sm lg:max-w-md ml-auto shadow-xl">
              <img src={posterAsset.url} alt="Youpi, tennis coach in Berlin, smiling on a clay court" className="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>

      {/* KEY FIGURES */}
      <section className="border-y border-border bg-card/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { i: "🌍", t: "40+ nationalities", d: "+200 players on court" },
            { i: "🎾", t: "6 clay courts", d: "Berlin-Nord · indoor in winter" },
            { i: "💬", t: "100% personalized", d: "Coaching built around you" },
          ].map((x) => (
            <div key={x.t} className="min-w-0">
              <div className="text-2xl">{x.i}</div>
              <div className="font-display uppercase text-lg mt-1">{x.t}</div>
              <div className="text-sm text-muted-foreground">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <h2 className="text-[clamp(1.75rem,6vw,3.5rem)] font-display uppercase break-words">
            Tired of <span className="text-clay">robotic coaches?</span>
          </h2>
          <div className="min-w-0">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              <strong className="text-ink">I left law for this.</strong> No baskets of balls fed without a word. Every session is a conversation — to fix your technique, sharpen your tactics and, above all, have a great time on court.
            </p>
            <a href="#coach" className="mt-5 inline-block font-semibold text-clay hover:underline">More about Youpi →</a>
          </div>
        </div>
      </section>

      {/* OFFERS */}
      <section id="offers" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <h2 className="text-[clamp(1.75rem,6vw,3.25rem)] font-display uppercase mb-8 break-words">What we offer</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <article className="min-w-0 p-7 rounded-3xl bg-card border-2 border-ink/10">
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Group lessons · 60 min</div>
            <h3 className="text-2xl sm:text-3xl mb-3 break-words">Small groups</h3>
            <p className="text-muted-foreground mb-6">Technique &amp; tactics in groups of 2 to 4 players, matched by level. Winter season bookings are open.</p>
            <div className="flex items-baseline gap-2"><span className="text-sm text-muted-foreground">from</span><span className="font-display text-4xl">€24</span><span className="text-sm text-muted-foreground">/ hour / person</span></div>
            <p className="mt-2 text-xs text-muted-foreground">Exact price depends on club, time and group size — shown when you book.</p>
          </article>
          <article className="min-w-0 p-7 rounded-3xl bg-card border-2 border-ink/10">
            <div translate="no" className="notranslate text-xs uppercase tracking-widest font-semibold text-clay mb-3">Tennis &amp; Social</div>
            <h3 className="text-2xl sm:text-3xl mb-3 break-words">Events</h3>
            <p className="text-muted-foreground mb-6">Single hobby tournament, double mixt tournament and fun formats like singles vs. couples — to break the ice.</p>
            <div className="flex items-baseline gap-2"><span className="font-display text-4xl">€25</span><span className="text-sm text-muted-foreground">/ person · 4h event</span></div>
          </article>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          A private lesson is also possible on request, but is a secondary option because indoor courts make it more expensive in winter. For a solo lesson or a group of 3, <button type="button" onClick={() => setContactOpen(true)} className="font-semibold text-clay hover:underline">contact me directly</button>.
        </p>
      </section>

      {/* PAST EVENTS */}
      <section id="past-events" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10 scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-2">Tennis &amp; Social</div>
            <h2 className="text-[clamp(1.75rem,6vw,3.25rem)] font-display uppercase break-words">Past events</h2>
          </div>
          <p className="max-w-lg text-sm text-muted-foreground">A look back at the formats already played with the Youpi community.</p>
        </div>
        <article className="min-w-0 border-y-2 border-ink/10 py-6 sm:py-8 grid md:grid-cols-[minmax(0,1fr)_auto] gap-6 md:items-center">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">August 17, 18 &amp; 20 · 2026</div>
            <h3 className="mt-2 text-2xl sm:text-3xl font-display uppercase break-words">Summer Camp 2026</h3>
            <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">
              Three two-hour sessions with two coaches, bringing together small groups of 4 to 6 players matched by level for focused work on footwork, tactics and technique.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center md:min-w-[19rem]">
            <div className="border-l-2 border-ink/10 px-2"><strong className="block font-display text-2xl">3</strong><span className="text-xs text-muted-foreground">sessions</span></div>
            <div className="border-l-2 border-ink/10 px-2"><strong className="block font-display text-2xl">2h</strong><span className="text-xs text-muted-foreground">each day</span></div>
            <div className="border-l-2 border-ink/10 px-2"><strong className="block font-display text-2xl">2</strong><span className="text-xs text-muted-foreground">coaches</span></div>
          </div>
        </article>
      </section>

      {/* LOCATION */}
      <section id="club" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="rounded-[2rem] bg-card border-2 border-ink/10 overflow-hidden grid lg:grid-cols-2">
          <div className="p-6 sm:p-10 min-w-0">
            <h2 className="text-[clamp(1.6rem,5vw,2.75rem)] font-display uppercase mb-5 break-words">
              Our home base: <span className="text-clay">BFC Alemannia</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-5">
              A warm club, 4 min walk from U8 Lindauer Allee. Clay courts in summer, indoor courts in winter.
            </p>
            <p className="text-sm text-ink">📍 Ollenhauerstr. 64e, 13403 Berlin</p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="font-semibold uppercase tracking-widest text-xs text-muted-foreground">Winter schedule</div>
              <div translate="no" className="notranslate"><strong>BFC Alemannia</strong> · Mo 13–16 · Di 12–15 · Mi 14–17 · Do 12–15 · Sa 09–11 &amp; 13–15 Uhr</div>
              <div translate="no" className="notranslate"><strong>TC Longline</strong> · Fr 11–17 Uhr</div>
            </div>
            <Link to="/book" className="mt-7 inline-block px-7 py-4 rounded-full bg-violet text-violet-foreground font-semibold hover:opacity-90 transition">
              Book your winter season →
            </Link>
          </div>
          <iframe
            title="BFC Alemannia on Google Maps"
            src="https://www.google.com/maps?q=Ollenhauerstr.+64e,+13403+Berlin&output=embed"
            className="w-full min-h-[300px] h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* COACH */}
      <section id="coach" className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-12">
        <div className="max-w-3xl">
          <h2 className="text-[clamp(1.7rem,6vw,3rem)] font-display uppercase mb-5 break-words">
            Your coach <span className="text-clay">Youpi</span>
          </h2>
          <div className="space-y-4 text-muted-foreground text-base sm:text-lg">
            <p>
              Originally from Paris 🇫🇷, I studied French-German Law in France and Germany. I discovered tennis 17 years ago and trained in France with experienced amateur players who passed on both the technical demands and the love of the game.
            </p>
            <p>
              The technical progress of every student is my priority — beginner or advanced — while making sure you enjoy every session. Clear, structured coaching, so you understand what you do, why, and how to apply it on your own.
            </p>
            <p className="font-semibold text-ink">Student satisfaction is what matters most to me.</p>
          </div>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { t: "WTA 500 · Rot-Weiß Berlin", d: "Kids program on tournament week." },
            { t: "ALBA × bett1 Schulcup", d: "Drills for ~150 school kids." },
            { t: "DTB top-ranked players", d: "Herren 45 #171 and Herren 55 #14." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border-2 border-ink/10 bg-card p-5 min-w-0">
              <div className="font-display uppercase break-words">{x.t}</div>
              <div className="text-sm text-muted-foreground mt-1">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PARTNERSHIP */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-4">
        <article className="rounded-2xl bg-card text-ink p-6 border-2 border-ink/10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:w-auto sm:gap-3">
              <img src={wellhubLogoAsset.url} alt="Wellhub" className="h-7 w-full min-w-0 object-contain sm:h-8 sm:max-w-[8rem]" />
              <span className="text-lg font-display uppercase">+</span>
              <img src={urbanSportsClubLogoAsset.url} alt="Urban Sports Club" className="h-9 w-full min-w-0 object-contain sm:h-10 sm:max-w-[9rem]" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-2xl uppercase text-destructive mb-1">Coming soon</div>
              <p className="text-sm text-ink/80">Partnership with Urban Sport for a nice discount on your tennis lessons 😉</p>
            </div>
          </div>
        </article>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-5 sm:px-6 py-10 sm:py-12">
        <h2 className="text-3xl sm:text-4xl font-display uppercase mb-8">FAQ</h2>
        <div className="divide-y divide-border border-y border-border">
          {[
            { q: "Do I need to be a club member to train?", a: "No — thanks to a special deal with the club, you can attend 2–3 training sessions before deciding to become a member." },
            { q: "What happens if it rains?", a: "More than 50% of the session played → no refund. Less than 50% → full refund or reschedule, your call." },
            { q: "I don't have a racket — is that a problem?", a: "Not at all: you can rent a racket for €2 per session." },
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
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/book" className="px-7 py-4 rounded-full bg-violet text-violet-foreground font-semibold hover:opacity-90 transition">Book your lesson 🎾</Link>
          <button type="button" onClick={() => setContactOpen(true)} className="px-7 py-4 rounded-full border-2 border-ink/15 font-semibold hover:border-clay hover:text-clay transition">Contact me 📩</button>
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

      {/* CONTACT MODAL */}
      {contactOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <button
            aria-label="Close"
            onClick={() => setContactOpen(false)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-card border-2 border-ink/10 shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setContactOpen(false)}
              className="absolute right-4 top-4 h-9 w-9 rounded-full bg-ink/5 grid place-items-center text-lg font-bold"
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="font-display text-2xl uppercase mb-4 pr-10">Contact me</h3>
            <div className="grid gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Email
                </div>
                <a
                  href="mailto:chaouchyoucef@yahoo.com"
                  className="font-semibold text-lg break-all hover:text-clay transition"
                >
                  chaouchyoucef@yahoo.com
                </a>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Phone
                </div>
                <a
                  href="tel:+4917645689622"
                  className="font-semibold text-lg hover:text-clay transition"
                >
                  +49 176 45689622
                </a>
                <div className="text-sm text-muted-foreground">(WhatsApp preferred)</div>
              </div>
            </div>
            <a
              href="https://wa.me/4917645689622"
              target="_blank"
              rel="noopener"
              className="mt-6 block text-center px-6 py-4 rounded-2xl bg-violet text-violet-foreground font-semibold hover:opacity-90 transition"
            >
              Write on WhatsApp 💬
            </a>
          </div>
        </div>
      )}
    </main>

  );
}
