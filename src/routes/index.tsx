import { createFileRoute, Link } from "@tanstack/react-router";
import posterAsset from "@/assets/youpi-court.jpg.asset.json";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FeedbackSection } from "@/components/FeedbackSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Youpi Tennis Club — Tennis lessons in Berlin" },
      {
        name: "description",
        content:
          "Fun, international tennis lessons in Berlin for all levels. Group sessions, privates and social events — book your first session today.",
      },
      { property: "og:title", content: "Youpi Tennis Club — Tennis lessons in Berlin" },
      {
        property: "og:description",
        content:
          "Fun, international tennis lessons in Berlin for all levels. Group sessions, privates and social events — book your first session today.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FLAGS = ["🇫🇷", "🇩🇪", "🇺🇸", "🇹🇷", "🇺🇦", "🇪🇸", "🇮🇹", "🇧🇷", "🇯🇵", "🇲🇽", "🇵🇱", "🇪🇬", "🇱🇧", "🇷🇺", "🇬🇷", "🇬🇧", "🇨🇳", "🇸🇪", "🇰🇷", "🇮🇳"];

function Index() {
  return (
    <main className="relative overflow-hidden text-left">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:flex lg:justify-between">
          <a href="#" className="flex min-w-0 items-center gap-2 font-display text-base sm:text-2xl md:text-3xl uppercase leading-tight">
            <span
              className="inline-block w-7 h-7 shrink-0 rounded-full bg-ball ball-spin shadow-inner"
              style={{ boxShadow: "inset -4px -4px 0 oklch(0.78 0.18 115)" }}
            />
            <span className="min-w-0 break-words">Youpi Tennis Club</span>
          </a>
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            <a href="#lessons" className="hover:text-clay transition">Lessons</a>
            <a href="#club" className="hover:text-clay transition">Club</a>
            <a href="#events" className="hover:text-clay transition">Events</a>
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column: Solo + Duo stacked */}
          <div className="flex flex-col gap-6">
            {[
              { tag: "Solo", title: "Private 1-on-1", price: "€50", desc: "60 min of focused coaching — beginner to advanced. Technique, tactics, match prep.", color: "bg-ball", icon: "🎾", unit: "/ session" },
              { tag: "Duo", title: "2-player · 60 min", price: "€25", desc: "Just two of you? Same energy, focused hour on court. Perfect with a friend or partner.", color: "bg-court", icon: "⚡", unit: "/ pers" },
            ].map((l) => (
              <article key={l.title} className="group relative p-6 sm:p-7 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300 flex-1">
                <div className={`absolute -top-4 -right-2 sm:-right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full ${l.color} grid place-items-center text-2xl sm:text-3xl shadow-lg`}>
                  {l.icon}
                </div>
                <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">{l.tag}</div>
                <h3 className="text-2xl sm:text-3xl mb-3 break-words pr-12">{l.title}</h3>
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
              <article key={l.title} className="group relative p-6 sm:p-7 rounded-3xl bg-card border-2 border-ink/10 hover:border-ink transition hover:-translate-y-1 duration-300">
                <div className={`absolute -top-4 -right-2 sm:-right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full ${l.color} grid place-items-center text-2xl sm:text-3xl shadow-lg`}>
                  {l.icon}
                </div>
                <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Squad</div>
                <h3 className="text-2xl sm:text-3xl mb-3 break-words pr-12">{l.title}</h3>
                <p className="text-muted-foreground mb-6">{l.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl">{l.price}</span>
                  <span className="text-sm text-muted-foreground">/ pers</span>
                </div>
                <ul className="mt-5 rounded-2xl bg-ball/30 border-2 border-ink/10 p-4 space-y-1.5">
                  {l.rates.map((r) => (
                    <li key={r.n} className="flex justify-between gap-3 text-sm">
                      <span className="text-ink/70 font-medium">{r.n}</span>
                      <span className="font-display text-ink shrink-0">{r.p} / pers</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CLUB */}
      <section id="club" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="rounded-[2rem] bg-card border-2 border-ink/10 p-5 sm:p-8 md:p-10">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase mb-5 break-words">
                BFC Alemannia<br/>
                <span className="text-clay">Tennis Club</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                After scouting the whole city, I finally found the right home for us: outdoor
                <strong> clay courts</strong> all summer until October, then indoor for the winter season.
              </p>
              <div className="space-y-3 text-ink">
                <div className="flex gap-3"><span className="shrink-0">📍</span><span className="min-w-0">Ollenhauerstr. 64e, 13403 Berlin</span></div>
                <div className="flex gap-3"><span className="shrink-0">🚉</span><span className="min-w-0">4 min walk from U8 Lindauer Allee &amp; S25 Karl-Bonhoeffer-Nervenklinik — <strong>easy from all of Berlin</strong></span></div>
                <div className="flex gap-3"><span className="shrink-0">🎾</span><span className="min-w-0">Only ~180 members for 6 clay courts (+ 2 in renovation) = <strong>real court availability in the evening after work</strong></span></div>
                <div className="flex gap-3"><span className="shrink-0">🥶</span><span className="min-w-0">Winter season: coaching agreements with <strong>TC Longline</strong> &amp; <strong>BFC Alemannia</strong> for extra flexibility</span></div>
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
              <div className="rounded-2xl bg-ball/30 border-2 border-ink/10 p-5 sm:p-6">
                <div className="font-display text-lg uppercase mb-3">Intro rates · First year <span className="text-sm normal-case text-muted-foreground">(from July 2026)</span></div>
                <div className="flex justify-between gap-3 py-1.5"><span>Single</span><span className="font-display text-xl shrink-0">€80</span></div>
                <div className="border-b-2 border-ink/10 mb-3 pb-3"></div>
                <div className="font-display text-lg uppercase mb-3">From year 2</div>
                <div className="flex justify-between gap-3 py-1.5"><span>Single</span><span className="font-display text-xl shrink-0">€320</span></div>
                <div className="flex justify-between gap-3 py-1.5"><span>Couple</span><span className="font-display text-xl shrink-0">€580</span></div>
                <div className="flex justify-between gap-3 py-1.5"><span className="min-w-0">Already member of another Berlin club</span><span className="font-display text-xl shrink-0">€160</span></div>
              </div>
              <div className="mt-5 p-5 rounded-2xl bg-court text-primary-foreground border-2 border-ink">
                <div className="font-display text-xl sm:text-2xl uppercase mb-2 break-words">🔓 Unlimited outdoor access</div>
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
      <section id="events" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <h2 className="text-[clamp(1.75rem,7vw,3.75rem)] font-display uppercase mb-3 break-words">
          Social <span className="text-pink">tennis</span>
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
            <div className="text-xs uppercase tracking-widest font-semibold text-clay mb-3">Summer camp .26</div>
            <h3 className="text-2xl sm:text-3xl mb-4 break-words pr-12">Summer Camp .26</h3>
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

      {/* COACH */}
      <section id="coach" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="max-w-3xl">
          <h2 className="text-[clamp(1.7rem,7vw,3.25rem)] font-display uppercase mb-5 break-words">
            Who is your <span className="text-pink">coach Youpi</span> ?
          </h2>
          <div className="space-y-4 text-muted-foreground text-base sm:text-lg">
            <p className="font-display text-xl uppercase text-ink">🎾 About me</p>
            <p>
              I'm Youpi, originally from Paris 🇫🇷, and I studied French-German Law in both France
              and Germany 🇫🇷🇩🇪.
            </p>
            <p>
              I discovered my passion for tennis 17 years ago. Over the years in France, I
              trained and played with high-level amateur players who passed on to me both the
              technical demands and the love of the game. That experience taught me that real
              progress comes from attention to detail, humility, and a genuine respect for the sport.
            </p>
            <p>
              For me, the technical progress of every student is a priority. Whether you're a
              complete beginner or an experienced player, my goal is to help you improve with
              clear, structured coaching in a positive and supportive atmosphere.
            </p>
            <p>
              I now train players at several clubs around Berlin, with BFC Alemannia as my main
              base. 🇩🇪
            </p>
            <p className="font-semibold text-ink">
              Come join the adventure in English, French &amp; German! 🚀🎾
            </p>
          </div>
        </div>

        {/* TRACK RECORD */}
        <div className="mt-8 rounded-3xl border-2 border-ink/10 p-5 sm:p-8 md:p-10 bg-card">
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-5">
            {[
              { t: "WTA 500 · Rot-Weiß Berlin", d: "Kids program — playful intro to tennis on tour week." },
              { t: "ALBA × bett1 Schulcup", d: "Tennis drills for ~150 school kids at the Basketball & Tennis Schulcup." },
              { t: "Jahn-Sportpark", d: "Multisport events for kids across the season." },
              { t: "Meisterklasse Damen", d: "Match-day coaching during Verbandsspiele." },
              { t: "DTB top-ranked players", d: "Tactical & technical work with Herren 45 #171 and Herren 55 #14." },
              { t: "Berlin tennis network", d: "Markus Zoecke (ex ATP #48 · WTA 500 director) and many trainers." },
            ].map((x) => (
              <div key={x.t} className="flex gap-4">
                <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-ball shrink-0" />
                <div className="min-w-0">
                  <div className="font-display text-base sm:text-lg uppercase break-words">{x.t}</div>
                  <div className="text-sm text-muted-foreground">{x.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-[clamp(1.7rem,7vw,3.25rem)] font-display uppercase mb-5 break-words">
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
              world in a fun, friendly and supportive atmosphere.
            </p>
            <p className="text-muted-foreground text-lg mb-4">
              🗣️ I speak fluent <strong>English, French &amp; German</strong>, so players from every
              background feel at home on court.
            </p>
            <p className="text-muted-foreground text-lg mb-4">
              💡 <strong>Technique</strong>, <strong>motivation</strong> and a real{" "}
              <strong>coach–student connection</strong> are the keys to real progress and to
              actually enjoying the game.
            </p>
            <p className="text-muted-foreground text-lg mb-6">
              👫 <strong>Want to train with your partner or with your friends?</strong><br/>
              I can build a group just for you. And I really take care of putting players together by level, so
              everyone enjoys the session — something most coaches simply don't do.
            </p>
            <p className="font-display text-2xl sm:text-3xl md:text-4xl uppercase leading-tight text-clay break-words">
              Student satisfaction is what matters most to me.
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
                <div className="text-3xl shrink-0">{x.i}</div>
                <div className="min-w-0">
                  <div className="font-display text-lg sm:text-xl uppercase mb-1 break-words">{x.t}</div>
                  <div className="text-sm text-muted-foreground">{x.d}</div>
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
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-[clamp(1.75rem,7vw,3.75rem)] font-display uppercase break-words">
                Winter<br/>season 🥶
              </h2>
              <p className="mt-5 text-background/70 text-lg max-w-md">
                Starting <strong className="text-sky">October</strong> — indoor courts, 1h30 every
                Saturday. Prices and slots are published in September, and you can already
                pre-book your spot.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { n: "TC Longline", d: "Winter coaching agreement — extra indoor slots." },
                { n: "BFC Alemannia", d: "Indoor courts on our home base." },
                { n: "More flexibility", d: "Two venues = more times, more options for you." },
              ].map((p) => (
                <div key={p.n} className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-background text-ink border-2 border-background">
                  <div className="min-w-0">
                    <div className="font-display text-xl sm:text-2xl uppercase break-words">{p.n}</div>
                    <div className="text-sm text-ink/70">{p.d}</div>
                  </div>
                  <div className="font-display text-3xl shrink-0">🎾</div>
                </div>
              ))}
              <Link to="/book" className="block text-center mt-4 px-7 py-4 rounded-full bg-violet text-violet-foreground font-semibold hover:opacity-90 transition">
                Pre-Book Your Winter Season →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BOOK CTA */}
      <section id="book" className="max-w-4xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="relative rounded-3xl bg-navy text-background overflow-hidden p-5 sm:p-10 md:p-14">
          <div className="absolute -bottom-14 -left-14 w-52 h-52 rounded-full bg-sky/30 blur-2xl" />
          <div className="relative">
            <h2 className="text-[clamp(1.9rem,7.5vw,4rem)] font-display uppercase mb-5 break-words whitespace-nowrap">
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
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <h2 className="text-4xl sm:text-5xl font-display uppercase mb-10">FAQ</h2>
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
      <footer className="bg-ink text-background mt-12">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="font-display text-xl sm:text-2xl uppercase">Youpi Tennis Club</div>
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
