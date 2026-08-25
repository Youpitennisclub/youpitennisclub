import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Youpi Multi Culti Tennis Berlin" },
      { name: "description", content: "How Youpi Multi Culti Tennis collects, uses and protects your personal data under the GDPR." },
      { property: "og:title", content: "Privacy Notice — Youpi Multi Culti Tennis" },
      { property: "og:description", content: "GDPR privacy notice for Youpi Multi Culti Tennis Berlin." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://youpitennisclub.com/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://youpitennisclub.com/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-xl">YOUPI<span className="text-clay">.</span></Link>
          <Link to="/" className="text-sm font-semibold hover:text-clay transition">← Back to site</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16 prose prose-neutral">
        <h1 className="font-display text-4xl md:text-5xl uppercase mb-4">Privacy Notice</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 26 July 2026</p>

        <p>
          This Privacy Notice (Datenschutzhinweis) explains how <strong>Youpi Multi Culti Tennis</strong>{" "}
          ("we", "us", "Youpi") collects, uses, and protects your personal data when you visit
          our website or book a tennis lesson with us. We process personal data in accordance
          with the EU General Data Protection Regulation (GDPR) and the German Federal Data
          Protection Act (BDSG).
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">1. Controller</h2>
        <p>
          The controller responsible for processing your personal data is:<br/>
          Youpi (Youcef Chaouch) — Tennis coaching in Berlin, Germany<br/>
          Email: chaouchyoucef@yahoo.com · Phone: +49 176 45689622
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">2. What data we collect</h2>
        <ul>
          <li><strong>Booking data:</strong> first name, last name, email address, phone number, chosen session date/time, tennis level.</li>
          <li><strong>Communication data:</strong> messages you send us by email, WhatsApp or through the site.</li>
          <li><strong>Technical data:</strong> IP address, browser type, device type, referrer, pages visited (via server logs).</li>
        </ul>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">3. Why we process it (legal basis)</h2>
        <ul>
          <li><strong>Performance of a contract</strong> (Art. 6(1)(b) GDPR): to organise and deliver the tennis session you booked, contact you about the booking, and process payment.</li>
          <li><strong>Legitimate interests</strong> (Art. 6(1)(f) GDPR): to keep the site secure, prevent abuse, and improve our services.</li>
          <li><strong>Consent</strong> (Art. 6(1)(a) GDPR): where you have expressly agreed, e.g. to receive updates.</li>
          <li><strong>Legal obligation</strong> (Art. 6(1)(c) GDPR): tax and bookkeeping duties.</li>
        </ul>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">4. Who sees your data on the booking page</h2>
        <p>
          To coordinate group sessions, other players who have unlocked the calendar can see
          your <strong>first name and the first two letters of your last name</strong> next to
          the slot you booked. Your email address, phone number and full last name are never
          shown to other visitors.
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">5. Data recipients & processors</h2>
        <ul>
          <li><strong>Hosting & database:</strong> Supabase / Lovable Cloud infrastructure (EU region) to store bookings.</li>
          <li><strong>Payments:</strong> Stripe Payments Europe when you pay online (see stripe.com/privacy).</li>
          <li><strong>Email:</strong> Your inbox provider when we contact you.</li>
        </ul>
        <p>We do not sell your data. We do not transfer it outside the EU/EEA unless adequate safeguards are in place.</p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">6. Retention</h2>
        <p>
          Booking data is kept as long as needed to run the session and afterwards for the
          statutory retention periods under German commercial and tax law (typically 6–10 years
          for invoicing records). Contact data is deleted on request unless a legal obligation
          requires us to retain it.
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">7. Your rights</h2>
        <p>Under the GDPR you have the right to:</p>
        <ul>
          <li>Access your data (Art. 15)</li>
          <li>Rectification (Art. 16)</li>
          <li>Erasure (Art. 17)</li>
          <li>Restriction of processing (Art. 18)</li>
          <li>Data portability (Art. 20)</li>
          <li>Object to processing (Art. 21)</li>
          <li>Withdraw consent at any time, without affecting prior processing</li>
          <li>Lodge a complaint with a supervisory authority, e.g. the Berlin Beauftragte für Datenschutz und Informationsfreiheit</li>
        </ul>
        <p>To exercise any of these rights, email <strong>chaouchyoucef@yahoo.com</strong>.</p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">8. Security</h2>
        <p>
          We use technical and organisational measures (encrypted connections, access
          controls, EU-based hosting) to protect your data against loss, misuse and
          unauthorised access.
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">9. Changes</h2>
        <p>
          We may update this notice from time to time. The current version is always
          available on this page.
        </p>

        <p className="mt-10 text-sm text-muted-foreground">
          See also our <Link to="/cookies" className="underline">Cookies Notice</Link>.
        </p>
      </article>
    </main>
  );
}
