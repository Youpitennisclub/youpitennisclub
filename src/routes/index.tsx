import { createFileRoute } from "@tanstack/react-router";
import posterAsset from "@/assets/poster-hero.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Youpi Multi Culti Tennis — Tennis lessons in Berlin" },
      {
        name: "description",
        content:
          "Fun, international tennis lessons in Berlin for young players. All levels, all languages — book your first session today.",
      },
      { property: "og:title", content: "Youpi Multi Culti Tennis — Berlin" },
      {
        property: "og:description",
        content: "Tennis lessons in Berlin for a young, international crowd. Beginner to advanced.",
      },
      { property: "og:image", content: posterAsset.url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: posterAsset.url },
    ],
  }),
  component: Index,
});

const FLAGS = ["🇫🇷", "🇩🇪", "🇺🇸", "🇹🇷", "🇺🇦", "🇪🇸", "🇮🇹", "🇧🇷", "🇯🇵", "🇲🇽", "🇵🇱", "🇪🇬", "🇱🇧", "🇷🇺", "🇬🇷", "🇬🇧", "🇨🇳", "🇸🇪", "🇰🇷", "🇮🇳"];

const LANGS = ["English", "Français", "Deutsch", "Español", "Italiano", "Türkçe", "Português", "العربية", "Русский"];

function Index() {
  return (
    <main className="relative overflow-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-display text-xl">
            <span className="inline-block w-7 h-7 rounded-full bg-ball ball-spin shadow-inner" style={{ boxShadow: "inset -4px -4px 0 oklch(0.78 0.18 115)" }} />
            YOUPI<span className="text-clay">.</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#lessons" className="hover:text-clay transition">Lessons</a>
            <a href="#club" className="hover:text-clay transition">Club</a>
            <a href="#events" className="hover:text-clay transition">Events</a>
            <a href="#coach" className="hover:text-clay transition">Coach</a>
            <a href="#pricing" className="hover:text-clay transition">Pricing</a>
            <a href="#faq" className="hover:text-clay transition">FAQ</a>
          </nav>
          <a href="#book" className="px-5 py-2.5 rounded-full bg-ink text-background text-sm font-semibold hover:bg-clay transition">
            Book a lesson
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 pt-14 pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ball/40 border border-ink/10 text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-court animate-pulse" />
              Now booking · Berlin courts
            </div>
            <h1 className="text-[clamp(3rem,8vw,7rem)] font-display uppercase">
              Tennis<br />
              <span className="text-clay">without</span><br />
              <span className="relative inline-block">
                borders
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8 C 80 2, 180 2, 298 8" stroke="oklch(0.92 0.21 115)" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-8 max-w-lg text-lg text-muted-foreground">
              Young, international, and seriously fun. Group lessons & private coaching across
              Berlin — taught in nine languages, played on every surface.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#book" className="px-7 py-4 rounded-full bg-court text-primary-foreground font-semibold hover:bg-ink transition">
                Reserve a spot
              </a>
              <a href="#lessons" className="px-7 py-4 rounded-full border-2 border-ink/15 font-semibold hover:border-clay hover:text-clay transition">
                See lessons →
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2 text-2xl">
                {FLAGS.slice(0, 6).map((f) => (
                  <span key={f} className="w-10 h-10 rounded-full bg-background border-2 border-background shadow-md grid place-items-center">{f}</span>
                ))}
              </div>
              <div>
                <div className="font-display text-2xl">+200</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">players · 40 nationalities</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-ball float-y" />
            <div className="absolute -bottom-8 -right-4 w-16 h-16 rounded-full bg-pink float-y" style={{ animationDelay: "1.5s" }} />
            <div className="relative rounded-3xl overflow-hidden border-4 border-ink shadow-[12px_12px_0_oklch(0.92_0.21_115)]">
              <img src={posterAsset.url} alt="Youpi Multi Culti Tennis coach with international players" className="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="relative py-6 bg-ink text-background overflow-hidden border-y-4 border-clay">
        <div className="marquee font-display text-4xl uppercase">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 items-center pr-12">
              {LANGS.map((l) => (
                <span key={`${i}-${l}`} className="flex items-center gap-12">
                  <span>{l}</span>
                  <span className="text-ball">●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* LESSONS */}
      <section id="lessons" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <h2 className="text-5xl md:text-7xl font-display uppercase max-w-2xl">
            Pick your <span className="text-court">game</span>.
          </h2>
          <p className="text-muted-foreground max-w-sm">
            From your very first serve to tournament prep. All formats taught in English,
            French, German and beyond.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { tag: "Solo", title: "Private 1-on-1", price: "€50", desc: "60 min of focused coaching — beginner to advanced. Technique, tactics, match prep.", color: "bg-ball", icon: "🎾" },
            { tag: "Squad", title: "Group (3–6) · 90 min", price: "€19–28", desc: "Technique, tactics, match play. 90-min sessions from 3 players (€28→€19 as the group grows).", color: "bg-pink", icon: "👯" },
            { tag: "Duo", title: "2-player · 60 min", price: "€25", desc: "Just two of you? Same energy, focused hour on court. Perfect with a friend or partner.", color: "bg-court", icon: "⚡" },
          ].map((l) => (
            <article key={l.title} className="group relative p-7 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
              <div className={`absolute -top-5 -right-5 w-16 h-16 rounded-full ${l.color} grid place-items-center text-3xl shadow-lg`}>
                {l.icon}
              </div>
              <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">{l.tag}</div>
              <h3 className="text-3xl mb-3">{l.title}</h3>
              <p className="text-muted-foreground mb-6">{l.desc}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl">{l.price}</span>
                <span className="text-sm text-muted-foreground">/ session</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CLUB */}
      <section id="club" className="max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-[2rem] bg-clay/10 border-2 border-clay/30 p-8 md:p-14">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-clay text-background text-xs font-semibold uppercase tracking-widest mb-6">
                🧱 New home · Clay courts
              </div>
              <h2 className="text-5xl md:text-6xl font-display uppercase mb-6">
                BFC Alemannia<br/>
                <span className="text-clay">Tennis Club</span>.
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                After scouting the whole city, I finally found the right home for us: outdoor
                <strong> clay courts</strong> all summer until October, then indoor for the winter season.
              </p>
              <div className="space-y-3 text-ink">
                <div className="flex gap-3"><span>📍</span><span>Ollenhauerstr. 64e, 13403 Berlin</span></div>
                <div className="flex gap-3"><span>🚉</span><span>5 min walk from U8 & S25 — easy from all of Berlin</span></div>
                <div className="flex gap-3"><span>🎾</span><span>Only ~150 members for 6 clay courts (+ 2 in renovation) = real court availability</span></div>
                <div className="flex gap-3"><span>❄️</span><span>Winter season: coaching agreements with <strong>TC Longline</strong> & <strong>BFC Alemannia</strong> for extra flexibility</span></div>
              </div>
              <div className="mt-8 p-5 rounded-2xl bg-ball/40 border-2 border-ink">
                <div className="font-display text-xl uppercase mb-2">Try before you join 🎁</div>
                <p className="text-sm text-ink/80">
                  Special deal with the club: attend <strong>2–3 training sessions</strong> before becoming a member.
                  Discover the club, meet the crew, then decide.
                </p>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-4">Club membership</div>
              <div className="rounded-2xl bg-ball/30 border-2 border-ink/10 p-6">
                <div className="font-display text-lg uppercase mb-3">Intro rates · First year</div>
                <div className="flex justify-between py-1.5"><span>Single</span><span className="font-display text-xl">€160</span></div>
                <div className="border-b-2 border-ink/10 mb-3 pb-3"></div>
                <div className="font-display text-lg uppercase mb-3">From year 2</div>
                <div className="flex justify-between py-1.5"><span>Single</span><span className="font-display text-xl">€320</span></div>
                <div className="flex justify-between py-1.5"><span>Couple</span><span className="font-display text-xl">€580</span></div>
                <div className="flex justify-between py-1.5"><span>Already member of another Berlin club</span><span className="font-display text-xl">€160</span></div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Membership isn't just for training — it gives you <strong>unlimited access to the outdoor courts</strong>
                to play with other members whenever you like.
              </p>

              <div className="mt-8 text-xs uppercase tracking-widest font-semibold text-clay mb-4">Group training rates · 90 min</div>
              <div className="rounded-2xl bg-ink text-background p-6">
                {[
                  { n: "3 players", p: "€28 / pers" },
                  { n: "4 players", p: "€25 / pers" },
                  { n: "5 players", p: "€22 / pers" },
                  { n: "6 players", p: "€19 / pers" },
                  { n: "2 players (60 min)", p: "€25 / pers" },
                  { n: "Private (60 min)", p: "€50" },
                ].map((r) => (
                  <div key={r.n} className="flex justify-between py-2 border-b border-background/10 last:border-0">
                    <span className="text-background/80">{r.n}</span>
                    <span className="font-display text-ball">{r.p}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                90-min sessions require min. 3 players. With only 2 registered, the session runs 60 min.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <h2 className="text-5xl md:text-7xl font-display uppercase max-w-2xl">
            Social <span className="text-pink">tennis</span>.
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Meet people, network, and have fun. Relaxed formats designed for young Berliners who want to play and connect.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <article className="group relative p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-pink grid place-items-center text-3xl shadow-lg">🥂</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">After-work</div>
            <h3 className="text-3xl mb-3">After-work tennis with colleagues</h3>
            <p className="text-muted-foreground mb-6">
              The perfect team-building ritual: rally with colleagues, then debrief over drinks.
              Beginner-friendly — no experience needed. I bring rackets, balls, and a relaxed vibe.
              Ideal for startups, law firms, and creative teams looking for a weekly escape from the desk.
            </p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl">€30</span>
              <span className="text-sm text-muted-foreground">/ pers · 90 min</span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-ball">✓</span> Groups of 2–6 people</li>
              <li className="flex gap-2"><span className="text-ball">✓</span> Tue / Wed / Thu after 18h</li>
              <li className="flex gap-2"><span className="text-ball">✓</span> Fun drills + mini-tournament</li>
            </ul>
          </article>

          <article className="group relative p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-ball grid place-items-center text-3xl shadow-lg">💑</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Mixed Doubles</div>
            <h3 className="text-3xl mb-3">Double mixt tournament</h3>
            <p className="text-muted-foreground mb-6">
              A fun, social mixed-doubles event where levels are balanced so every match is competitive.
              Great for meeting new people in Berlin's international crowd. Rotating partners,
              music between sets, and a laid-back atmosphere guaranteed.
            </p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl">€20</span>
              <span className="text-sm text-muted-foreground">/ pers · 2h event</span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-ball">✓</span> 8–16 players, balanced levels</li>
              <li className="flex gap-2"><span className="text-ball">✓</span> Rotating partners every round</li>
              <li className="flex gap-2"><span className="text-ball">✓</span> Fri evening or Sat afternoon</li>
            </ul>
          </article>
        </div>
      </section>

      {/* COACH */}
      <section id="coach" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-4">Meet your coach</div>
            <h2 className="text-5xl md:text-6xl font-display uppercase mb-6">
              Youcef.<br/>
              <span className="text-pink">One court,</span> three languages.
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              I'm <strong>Youpi</strong> — Franco-German lawyer turned full-time tennis
              coach in Berlin. Two Master's degrees in Franco-German law, then I put the robe down
              to chase the only thing I love more: tennis.
            </p>
            <p className="text-muted-foreground text-lg mb-6">
              Coaching since 2021 — group sessions up to 8, privates from total beginner to
              advanced, and team coaching for Damen- & Herrenmannschaften up to{" "}
              <strong>Meisterklasse</strong>. I also work with strong ranked players
              (DTB Herren 45 #171, Herren 55 #14). Sessions run in{" "}
              <strong>English, French & German</strong>.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "DTB Tennisassistent",
                "5+ years coaching",
                "Meisterklasse team coach",
                "WTA 500 Berlin kids program",
                "ALBA × bett1 Schulcup",
                "EN · FR · DE",
              ].map((b) => (
                <span key={b} className="px-4 py-2 rounded-full bg-muted text-sm font-medium">{b}</span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: "5+", l: "Years coaching" },
                { n: "3", l: "Languages" },
                { n: "150", l: "Kids @ Schulcup" },
                { n: "Mo–Sa", l: "PM & weekends" },
              ].map((s) => (
                <div key={s.l} className="aspect-square rounded-3xl bg-card border-2 border-ink/10 p-6 flex flex-col justify-between hover:bg-ball hover:border-ink transition">
                  <div className="font-display text-6xl">{s.n}</div>
                  <div className="text-sm uppercase tracking-widest font-semibold">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TRACK RECORD */}
        <div className="mt-20 rounded-3xl border-2 border-ink/10 p-8 md:p-12 bg-card">
          <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-6">Track record · Berlin</div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-5">
            {[
              { t: "WTA 500 · Rot-Weiß Berlin", d: "Kids program — playful intro to tennis on tour week." },
              { t: "ALBA × bett1 Schulcup", d: "Tennis drills for ~150 school kids at the Basketball & Tennis Schulcup." },
              { t: "Jahn-Sportpark", d: "Multisport events for kids across the season." },
              { t: "Meisterklasse Damen", d: "Match-day coaching during Verbandsspiele." },
              { t: "DTB top-ranked players", d: "Tactical & technical work with Herren 45 #171 and Herren 55 #14." },
              { t: "Berlin tennis network", d: "Markus Zoecke (ex ATP #48 · WTA 500 director), TVBB and many trainers." },
            ].map((x) => (
              <div key={x.t} className="flex gap-4">
                <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-ball shrink-0" />
                <div>
                  <div className="font-display text-lg uppercase">{x.t}</div>
                  <div className="text-sm text-muted-foreground">{x.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-4">Why Youpi</div>
            <h2 className="text-5xl md:text-6xl font-display uppercase mb-6">
              No place in a club?<br/>
              <span className="text-clay">Tired of ball-feeders?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              <strong>No place in a Berlin tennis club?</strong> Tired of coaches who just{" "}
              <strong>feed balls</strong> and rarely correct your technique? Whether you want to{" "}
              <strong>learn tennis from scratch</strong> or <strong>take your game to the next level</strong>{" "}
              with a passionate and dedicated coach — I'm here for it. 💪🎾
            </p>
            <p className="text-muted-foreground text-lg mb-4">
              🌍 Join our <strong>multicultural tennis classes</strong> and meet students from all over the
              world in a fun, friendly and supportive atmosphere. 🗣️ I speak fluent{" "}
              <strong>English, French & German</strong>, so players from every background feel at
              home on court.
            </p>
            <p className="text-muted-foreground text-lg mb-6">
              💡 <strong>Technique</strong>, <strong>motivation</strong> and a real{" "}
              <strong>coach–student connection</strong> are the keys to real progress and to
              actually enjoying the game. 🤝 Great coaching is a{" "}
              <strong>two-way process</strong> — I'm approachable, open to feedback, and committed
              to helping you improve every session.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Tennis lessons Berlin",
                "Multicultural",
                "EN · FR · DE",
                "Personalized coaching",
                "Technique & tactics",
                "Beginner to advanced",
                "Clay courts",
                "Passionate coach",
              ].map((k) => (
                <span key={k} className="px-3 py-1.5 rounded-full bg-ball/60 border border-ink/20 text-xs font-semibold uppercase tracking-wide">
                  #{k}
                </span>
              ))}
            </div>

          </div>
          <div className="space-y-4">
            {[
              { i: "🎾", t: "Personalized coaching", d: "Every session is built around your level, your goals, and the parts of your game you actually want to fix." },
              { i: "🌍", t: "Truly multicultural", d: "Berlin's international crowd on one court — new friends, new rally partners, zero cliques." },
              { i: "💬", t: "Two-way process", d: "Great coaching is a conversation. Tell me what works, what doesn't, and we adjust." },
              { i: "🔥", t: "Passion first", d: "I left law for this. Expect energy, focus and a coach who actually cares if you improve." },
            ].map((x) => (
              <div key={x.t} className="flex gap-4 p-5 rounded-2xl bg-card border-2 border-ink/10 hover:border-ink transition">
                <div className="text-3xl">{x.i}</div>
                <div>
                  <div className="font-display text-xl uppercase mb-1">{x.t}</div>
                  <div className="text-sm text-muted-foreground">{x.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GOOD TO KNOW */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-ball/40 border-2 border-ink p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-4">Good to know</div>
              <h2 className="text-4xl md:text-5xl font-display uppercase mb-4">
                How it <span className="text-clay">works</span>.
              </h2>
              <p className="text-ink/80">Simple rules so everyone gets a fair, focused session on court.</p>
            </div>
            <ul className="space-y-4 text-ink">
              <li className="flex gap-3"><span>✅</span><span><strong>90-min group sessions</strong> from 3 players — plenty of time for drills, tactics and point play.</span></li>
              <li className="flex gap-3"><span>✅</span><span><strong>Only 2 registered?</strong> Session runs 60 min instead of 90.</span></li>
              <li className="flex gap-3"><span>✅</span><span><strong>Cancellation:</strong> less than 24h before the session, the full fee is charged.</span></li>
              <li className="flex gap-3"><span>🌧️</span><span><strong>Rain policy:</strong> more than 50% played → no refund. Less than 50% → full refund or reschedule, your call.</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* WINTER SEASON */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-[2rem] bg-ink text-background p-10 md:p-16 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-court opacity-30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-pink opacity-20 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-ball text-xs uppercase tracking-widest font-semibold mb-4">❄️ Coming up</div>
              <h2 className="text-5xl md:text-7xl font-display uppercase">
                Winter<br/>season<span className="text-ball">.</span>
              </h2>
              <p className="mt-6 text-background/70 text-lg max-w-md">
                Starting <strong className="text-ball">October</strong> — indoor courts, new schedule, new groups.
                Full details drop very soon.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { n: "TC Longline", d: "Winter coaching agreement — extra indoor slots." },
                { n: "BFC Alemannia", d: "Indoor courts on our home base." },
                { n: "More flexibility", d: "Two venues = more times, more options for you." },
              ].map((p) => (
                <div key={p.n} className="flex items-center justify-between p-5 rounded-2xl border border-background/15 hover:border-ball transition">
                  <div>
                    <div className="font-display text-2xl uppercase">{p.n}</div>
                    <div className="text-sm text-background/60">{p.d}</div>
                  </div>
                  <div className="font-display text-3xl text-ball">🎾</div>
                </div>
              ))}
              <a href="#book" className="block text-center mt-4 px-7 py-4 rounded-full bg-ball text-ink font-semibold hover:bg-background transition">
                Get on the winter list →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BOOK */}
      <section id="book" className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl md:text-7xl font-display uppercase mb-6">
          Ready? <span className="text-clay">Los geht's.</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-10">
          Drop a line — name, level, preferred language. I'll come back within 24h with court
          options near you.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); alert("Danke! We'll be in touch within 24h."); }}
          className="grid gap-3 text-left"
        >
          <div className="grid md:grid-cols-2 gap-3">
            <input required placeholder="Your name" className="px-5 py-4 rounded-2xl bg-card border-2 border-ink/10 focus:border-court outline-none transition" />
            <input required type="email" placeholder="Email" className="px-5 py-4 rounded-2xl bg-card border-2 border-ink/10 focus:border-court outline-none transition" />
          </div>
          <select className="px-5 py-4 rounded-2xl bg-card border-2 border-ink/10 focus:border-court outline-none transition">
            <option>I'm a total beginner</option>
            <option>I've played casually before</option>
            <option>Intermediate — I rally</option>
            <option>Advanced / competitive</option>
          </select>
          <textarea rows={4} placeholder="Tell me about your goals (any language!)" className="px-5 py-4 rounded-2xl bg-card border-2 border-ink/10 focus:border-court outline-none transition" />
          <button className="mt-2 px-7 py-5 rounded-2xl bg-court text-primary-foreground font-semibold text-lg hover:bg-ink transition">
            Send & book my first lesson
          </button>
        </form>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-5xl font-display uppercase mb-10">FAQ.</h2>
        <div className="divide-y divide-border border-y border-border">
          {[
            { q: "Where do we play?", a: "Indoor & outdoor courts across Mitte, Kreuzberg, Prenzlauer Berg, Charlottenburg and Tempelhof." },
            { q: "I don't speak German. Is that ok?", a: "Absolutely — most of our community is international. Lessons run in English by default." },
            { q: "Do I need my own racket?", a: "Not for your first session. We bring spare rackets and all the balls you can hit." },
            { q: "How do I pay?", a: "Card, SEPA, PayPal or cash on court. Packs are non-refundable but transferable." },
          ].map((f) => (
            <details key={f.q} className="group py-6 cursor-pointer">
              <summary className="flex items-center justify-between font-display text-xl uppercase list-none">
                {f.q}
                <span className="text-clay text-3xl group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ink text-background mt-12">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
          <div>
            <div className="font-display text-3xl mb-3">YOUPI<span className="text-clay">.</span></div>
            <p className="text-background/60 text-sm">Multi Culti Tennis · Berlin since 2019.</p>
          </div>
          <div className="text-sm space-y-2">
            <div className="font-semibold uppercase tracking-widest text-ball mb-3 text-xs">Contact</div>
            <div>hallo@youpitennis.berlin</div>
            <div>Youcef · +49 176 45689622</div>
            <div>WhatsApp · Instagram @youpitennis</div>
          </div>
          <div className="text-sm space-y-2">
            <div className="font-semibold uppercase tracking-widest text-ball mb-3 text-xs">Languages on court</div>
            <div className="flex flex-wrap gap-2">
              {FLAGS.map((f) => <span key={f} className="text-xl">{f}</span>)}
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 py-5 text-center text-xs text-background/40">
          © {new Date().getFullYear()} Youpi Multi Culti Tennis · Made with 🎾 in Berlin
        </div>
      </footer>
    </main>
  );
}
