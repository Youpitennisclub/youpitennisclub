import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum — Youpi Tennis Club Berlin" },
      { name: "description", content: "Impressum (Angaben gemäß § 5 TMG) von Youpi Tennis Club, Berlin." },
      { property: "og:title", content: "Impressum — Youpi Tennis Club" },
      { property: "og:description", content: "Impressum von Youpi Tennis Club Berlin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ImpressumPage,
});

function ImpressumPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-xl">YOUPI<span className="text-clay">.</span></Link>
          <Link to="/" className="text-sm font-semibold hover:text-clay transition">← Back to site</Link>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <h1 className="font-display text-4xl uppercase">Impressum</h1>
        <section>
          <h2 className="font-display text-xl uppercase mb-2">Angaben gemäß § 5 TMG</h2>
          <p>Youcef Chaouch<br />Eschengraben 5<br />13189 Berlin<br />Deutschland</p>
        </section>
        <section>
          <h2 className="font-display text-xl uppercase mb-2">Kontakt</h2>
          <p>
            E-Mail: <a href="mailto:youpitennisclub@gmail.com" className="text-clay underline">youpitennisclub@gmail.com</a><br />
            Telefon: <a href="tel:+4917645689622" className="text-clay underline">+49 176 45689622</a>
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl uppercase mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>Youcef Chaouch<br />Eschengraben 5<br />13189 Berlin</p>
        </section>
        <section>
          <h2 className="font-display text-xl uppercase mb-2">Umsatzsteuer</h2>
          <p>Als Kleinunternehmer im Sinne von § 19 UStG wird keine Umsatzsteuer berechnet.</p>
        </section>
      </article>
    </main>
  );
}
