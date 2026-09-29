import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";

const TITLE = "About Youpi — International Tennis Coach in Berlin";
const DESCRIPTION =
  "Meet Youpi, a multilingual tennis coach in Berlin focused on technique, clear instruction and enjoyable progress for every level.";

const EXPERIENCE = [
  { t: "WTA 500 · Rot-Weiß Berlin", d: "Kids program — playful intro to tennis on tournament week." },
  { t: "ALBA × bett1 Schulcup", d: "Tennis drills for around 150 school kids at the Basketball & Tennis Schulcup." },
  { t: "Jahn-Sportpark", d: "Multisport events for kids across the season." },
  { t: "Meisterklasse Damen", d: "Match-day coaching during team's competition." },
  { t: "DTB top-ranked players", d: "Tactical and technical work with Herren 45 #171 and Herren 55 #14." },
  { t: "Berlin tennis network", d: "Markus Zoecke (ex ATP #48 · WTA 500 director) and many trainers." },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://youpitennisclub.com/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-5 py-10 text-left sm:px-6 sm:py-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay">About me</p>
          <h1 className="mb-7 text-4xl font-display uppercase break-words sm:text-6xl">
            Who is your <span className="text-pink">coach Youpi?</span>
          </h1>
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>I'm Youpi, originally from Paris 🇫🇷, and I studied French-German Law in both France and Germany 🇫🇷🇩🇪.</p>
            <p>
              I discovered my passion for tennis 17 years ago. In France, I trained and played with experienced amateur players who passed on both the technical demands and the love of the game.
            </p>
            <p>
              The technical progress of every student is my priority. I combine clear, structured coaching with an enjoyable atmosphere, so you understand what you are doing, why you are doing it and how to apply it independently.
            </p>
            <p>I currently train players at several clubs around Berlin, with BFC Alemannia as my main base.</p>
            <p className="font-semibold text-ink">Come join the adventure in English, French &amp; German! 🚀🎾</p>
          </div>
        </div>

        <div className="mt-12 border-y-2 border-ink/10 py-8">
          <h2 className="mb-7 text-2xl font-display uppercase sm:text-3xl">Experience</h2>
          <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {EXPERIENCE.map((item) => (
              <div key={item.t} className="flex min-w-0 gap-4">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-ball" />
                <div className="min-w-0">
                  <h3 className="text-base font-display uppercase break-words sm:text-lg">{item.t}</h3>
                  <p className="text-sm text-muted-foreground">{item.d}</p>
                </div>
              </div>
            ))}
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