import { createFileRoute, Link } from "@tanstack/react-router";
import posterAsset from "@/assets/youpi-court.jpg.asset.json";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Youpi Multi Culti Tennis — Tennis lessons in Berlin" },
      {
        name: "description",
        content:
          "Fun, international tennis lessons in Berlin for all players. All levels, all languages — book your first session today.",
      },
      { property: "og:title", content: "Youpi Multi Culti Tennis — Tennis lessons in Berlin" },
      {
        property: "og:description",
        content: "Fun, international tennis lessons in Berlin for all players. All levels, all languages — book your first session today.",
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
          <Link to="/book" className="px-5 py-2.5 rounded-full bg-violet text-violet-foreground text-sm font-semibold hover:opacity-90 transition">
            Book your lesson
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 pt-14 pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 relative z-10">
            <h1 className="text-[clamp(3rem,8vw,7rem)] font-display uppercase">
              Tennis<br />
              <span className="text-clay">without</span><br />
              borders.
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/book" className="px-7 py-4 rounded-full bg-violet text-violet-foreground font-semibold hover:opacity-90 transition">
                Book your lesson 🎾
              </Link>
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
            <div className="relative rounded-3xl overflow-hidden">
              <img src={posterAsset.url} alt="Youpi, tennis coach in Berlin, smiling on a clay court" className="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>


      {/* LESSONS */}
      <section id="lessons" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <h2 className="text-5xl md:text-7xl font-display uppercase max-w-2xl">
            Pick your <span className="text-court">game</span>.
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column: Solo + Duo stacked */}
          <div className="flex flex-col gap-6">
            {[
              { tag: "Solo", title: "Private 1-on-1", price: "€50", desc: "60 min of focused coaching — beginner to advanced. Technique, tactics, match prep.", color: "bg-ball", icon: "🎾", unit: "/ session" },
              { tag: "Duo", title: "2-player · 60 min", price: "€25", desc: "Just two of you? Same energy, focused hour on court. Perfect with a friend or partner.", color: "bg-court", icon: "⚡", unit: "/ pers" },
            ].map((l) => (
              <article key={l.title} className="group relative p-7 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300 flex-1">
                <div className={`absolute -top-5 -right-5 w-16 h-16 rounded-full ${l.color} grid place-items-center text-3xl shadow-lg`}>
                  {l.icon}
                </div>
                <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">{l.tag}</div>
                <h3 className="text-3xl mb-3">{l.title}</h3>
                <p className="text-muted-foreground mb-6">{l.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl">{l.price}</span>
                  <span className="text-sm text-muted-foreground">{l.unit}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Squad 90 min & Squad 60 min side by side (span 2 cols on lg) */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Group · 90 min",
                price: "€19–37",
                desc: "Full session for technique, tactics and match play. The bigger the squad, the cheaper per player.",
                color: "bg-pink",
                icon: "👯",
                rates: [
                  { n: "2 players", p: "€37" },
                  { n: "3 players", p: "€28" },
                  { n: "4 players", p: "€25" },
                  { n: "5 players", p: "€22" },
                  { n: "6 players", p: "€19" },
                ],
              },
              {
                title: "Group · 60 min",
                price: "€13–25",
                desc: "Shorter, punchier version — great for lunch breaks or a quick after-work hit.",
                color: "bg-court",
                icon: "⚡",
                rates: [
                  { n: "2 players", p: "€25" },
                  { n: "3 players", p: "€19" },
                  { n: "4 players", p: "€17" },
                  { n: "5 players", p: "€15" },
                  { n: "6 players", p: "€13" },
                ],
              },
            ].map((l) => (
              <article key={l.title} className="group relative p-7 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
                <div className={`absolute -top-5 -right-5 w-16 h-16 rounded-full ${l.color} grid place-items-center text-3xl shadow-lg`}>
                  {l.icon}
                </div>
                <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Squad</div>
                <h3 className="text-3xl mb-3">{l.title}</h3>
                <p className="text-muted-foreground mb-6">{l.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl">{l.price}</span>
                  <span className="text-sm text-muted-foreground">/ pers</span>
                </div>
                <ul className="mt-5 rounded-2xl bg-ball/30 border-2 border-ink/10 p-4 space-y-1.5">
                  {l.rates.map((r) => (
                    <li key={r.n} className="flex justify-between text-sm">
                      <span className="text-ink/70 font-medium">{r.n}</span>
                      <span className="font-display text-ink">{r.p} / pers</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
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
                <div className="flex gap-3"><span>🚉</span><span>4 min walk from U8 Lindauer Allee & S25 Karl-Bonhoeffer-Nervenklinik — <strong>easy from all of Berlin</strong></span></div>
                <div className="flex gap-3"><span>🎾</span><span>Only ~180 members for 6 clay courts (+ 2 in renovation) = <strong>real court availability in the evening after work</strong></span></div>
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
                <div className="font-display text-lg uppercase mb-3">Intro rates · First year <span className="text-sm normal-case text-muted-foreground">(from July 2026)</span></div>
                <div className="flex justify-between py-1.5"><span>Single</span><span className="font-display text-xl">€80</span></div>
                <div className="border-b-2 border-ink/10 mb-3 pb-3"></div>
                <div className="font-display text-lg uppercase mb-3">From year 2</div>
                <div className="flex justify-between py-1.5"><span>Single</span><span className="font-display text-xl">€320</span></div>
                <div className="flex justify-between py-1.5"><span>Couple</span><span className="font-display text-xl">€580</span></div>
                <div className="flex justify-between py-1.5"><span>Already member of another Berlin club</span><span className="font-display text-xl">€160</span></div>
              </div>
              <div className="mt-5 p-5 rounded-2xl bg-court text-primary-foreground border-2 border-ink">
                <div className="font-display text-2xl uppercase mb-2">🔓 Unlimited outdoor access</div>
                <p className="text-sm">
                  Membership isn't just for training — you get <strong>unlimited access to the outdoor clay courts</strong>
                  {" "}to play with other members whenever you like, all summer long.
                </p>
              </div>
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
            Meet people, network, and have fun. Relaxed formats designed for Berliners who want to play and connect.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <article className="group relative p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-pink grid place-items-center text-3xl shadow-lg">🏆</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Hobby League</div>
            <h3 className="text-3xl mb-3">Single hobby tournament</h3>
            <p className="text-muted-foreground mb-6">
              A friendly singles tournament for hobby players who love the thrill of match play
              without the pressure of official rankings. Short-format matches, balanced brackets by level,
              and a chill Berlin vibe. Perfect way to test your game and meet new rally partners.
            </p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl">€25</span>
              <span className="text-sm text-muted-foreground">/ pers · 4h event</span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-ball">✓</span> Balanced brackets, all levels welcome</li>
              <li className="flex gap-2"><span className="text-ball">✓</span> Short-format matches</li>
              <li className="flex gap-2"><span className="text-ball">✓</span> Weekend afternoons</li>
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
              <span className="font-display text-4xl">€25</span>
              <span className="text-sm text-muted-foreground">/ pers · 4h event</span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-ball">✓</span> 16–24 players, balanced levels</li>
              <li className="flex gap-2"><span className="text-ball">✓</span> Rotating partners every round</li>
              <li className="flex gap-2"><span className="text-ball">✓</span> Fri &amp; Saturday afternoon or Sunday afternoon</li>
            </ul>
          </article>

          <article className="group relative p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-violet text-violet-foreground grid place-items-center text-3xl shadow-lg">💞</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Fun format</div>
            <h3 className="text-3xl mb-3">Single status against couples tournament</h3>
            <p className="text-muted-foreground mb-6">
              The concept: singles players team up and take on the couples in a friendly, funny
              tournament. Expect teasing, cheering and a great atmosphere on court — the perfect
              excuse to meet new people in Berlin.
            </p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-violet">✓</span> Singles team vs. couples team</li>
              <li className="flex gap-2"><span className="text-violet">✓</span> All levels, balanced matches</li>
              <li className="flex gap-2"><span className="text-violet">✓</span> Weekend afternoons</li>
            </ul>
          </article>

          <article className="group relative p-8 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
            <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-clay text-background grid place-items-center text-3xl shadow-lg">☀️</div>
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Summer camp</div>
            <h3 className="text-3xl mb-3">Summer Camp · 12.08 – 17.08</h3>
            <p className="text-muted-foreground mb-6">
              Two coaches, two groups of maximum 6 players. 2 hours per day (18:00–20:00) on
              12.08, 14.08 and 17.08 — intensive drills, tactics and match play.
            </p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl">€100</span>
              <span className="text-sm text-muted-foreground">/ pers · 3 sessions of 2h</span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-clay">✓</span> 2 coaches · 2 groups · max 6 players each</li>
              <li className="flex gap-2"><span className="text-clay">✓</span> 12.08, 14.08 &amp; 17.08 · 18:00–20:00</li>
              <li className="flex gap-2"><span className="text-clay">✓</span> Book your spot in the calendar</li>
            </ul>
          </article>
        </div>
      </section>

      {/* COACH */}
      <section id="coach" className="relative max-w-4xl mx-auto px-6 py-24">
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-4">Meet your coach</div>
          <h2 className="text-5xl md:text-6xl font-display uppercase mb-6">
            Youpi.<br/>
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
            <p className="text-muted-foreground text-lg mb-6">
              👫 <strong>Want to train with your partner or with your friends?</strong> I can build a
              group just for you. And I really take care of putting players together by level, so
              everyone enjoys the session — something most coaches simply don't do.
            </p>
            <p className="font-display text-3xl md:text-4xl uppercase leading-tight text-clay">
              Client satisfaction is what matters most to me.
            </p>


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
        <div className="rounded-3xl bg-clay text-background p-8 md:p-12">
          <div className="text-xs uppercase tracking-widest font-semibold text-background/80 mb-3">Good to know</div>
          <h2 className="text-4xl md:text-6xl font-display uppercase mb-8">
            How it works<span className="text-ink">.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { i: "🎾", t: "90-min group sessions", d: "From 3 players — plenty of time for drills, tactics and point play." },
              { i: "👥", t: "Only 2 registered?", d: "The session runs 60 min instead of 90." },
              { i: "⏰", t: "Cancellation", d: "Less than 24h before the session, the full fee is charged." },
              { i: "🌧️", t: "Rain policy", d: "More than 50% played → no refund. Less than 50% → full refund or reschedule, your call." },
            ].map((r) => (
              <div key={r.t} className="rounded-2xl bg-background text-ink p-6 md:p-7">
                <div className="text-3xl mb-2">{r.i}</div>
                <div className="font-display text-2xl md:text-3xl uppercase mb-2">{r.t}</div>
                <p className="text-base md:text-lg text-ink/80">{r.d}</p>
              </div>
            ))}
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
              <Link to="/book" className="block text-center mt-4 px-7 py-4 rounded-full bg-ball text-ink font-semibold hover:bg-background transition">
                Get on the winter list →
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* BOOK CTA */}
      <section id="book" className="max-w-4xl mx-auto px-6 py-24">
        <div className="relative rounded-3xl bg-ink text-background overflow-hidden p-10 md:p-16 text-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-ball ball-spin opacity-90" />
          <div className="absolute -bottom-14 -left-14 w-52 h-52 rounded-full bg-clay/30 blur-2xl" />
          <div className="relative">
            <h2 className="text-5xl md:text-7xl font-display uppercase mb-6">
              Ready? <span className="text-ball">Los geht's.</span>
            </h2>
            <p className="text-background/70 text-lg mb-10 max-w-xl mx-auto">
              Pick your slot, choose your level, and lock it in. Instant confirmation — no
              back-and-forth.
            </p>
            <Link
              to="/book"
              className="inline-block px-10 py-5 rounded-full bg-ball text-ink font-semibold text-xl hover:bg-background transition shadow-xl"
            >
              Book your tennis session 🎾
            </Link>
            <p className="mt-6 text-sm text-background/60">
              Mon–Fri from 5&nbsp;PM · Sat 10&nbsp;AM–4&nbsp;PM · 90 min sessions
            </p>
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-5xl font-display uppercase mb-10">FAQ.</h2>
        <div className="divide-y divide-border border-y border-border">
          {[
            { q: "Where do we play?", a: "Summer season: BFC Alemannia Tennis Club — Ollenhauerstr. 64e, 13403 Berlin (clay courts). Winter season: TC Longline, with possible extra slots at TCW and Sportcenter Wittenau." },
            { q: "I don't speak German. Is that ok?", a: "Absolutely — most of our community is international. Lessons run in English by default." },
            { q: "Do I need my own racket?", a: "No — but you can rent a racket for €2 per session." },
            { q: "How do I pay?", a: "PayPal, SEPA or cash on court. Packs are non-refundable but transferable." },
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
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-2xl">YOUPI<span className="text-clay">.</span></div>
          <div className="flex gap-6 text-sm text-background/70">
            <Link to="/privacy" className="hover:text-ball transition">Privacy</Link>
            <Link to="/cookies" className="hover:text-ball transition">Cookies</Link>
          </div>
        </div>
        <div className="border-t border-background/10 py-5 text-center text-xs text-background/40">
          © {new Date().getFullYear()} Youpi Multi Culti Tennis · Made with 🎾 in Berlin
        </div>
      </footer>
    </main>
  );
}
