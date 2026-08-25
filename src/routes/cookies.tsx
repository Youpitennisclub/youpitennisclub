import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies Notice — Youpi Multi Culti Tennis Berlin" },
      { name: "description", content: "How Youpi Multi Culti Tennis uses cookies and local storage on this website." },
      { property: "og:title", content: "Cookies Notice — Youpi Multi Culti Tennis" },
      { property: "og:description", content: "Cookies notice for Youpi Multi Culti Tennis Berlin." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://youpitennisclub.com/cookies" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://youpitennisclub.com/cookies" }],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-xl">YOUPI<span className="text-clay">.</span></Link>
          <Link to="/" className="text-sm font-semibold hover:text-clay transition">← Back to site</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16 prose prose-neutral">
        <h1 className="font-display text-4xl md:text-5xl uppercase mb-4">Cookies Notice</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 26 July 2026</p>

        <p>
          This Cookies Notice (Cookies-Hinweis) explains how <strong>Youpi Multi Culti Tennis</strong>{" "}
          uses cookies and similar technologies (such as browser local storage) on this website.
          It complements our <Link to="/privacy" className="underline">Privacy Notice</Link>.
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">1. What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website.
          "Local storage" works similarly: it lets a site remember information between visits
          without sending it back to a server. Both help websites function properly and
          remember your preferences.
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">2. What we use on this site</h2>
        <p>We keep it minimal. On this website we use:</p>
        <ul>
          <li>
            <strong>Strictly necessary local storage</strong> — we store the contact details you
            enter to unlock the booking calendar (first name, last name, email, phone) in your
            browser's local storage under the key <code>youpi_visitor_v1</code>, so you don't
            have to fill the form every time. This data stays on your device and is only
            sent to our servers when you actually book a lesson.
          </li>
          <li>
            <strong>Server logs</strong> — our hosting provider records technical information
            (IP, user agent, time) for security and troubleshooting. This is not a cookie, but
            we mention it for transparency.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> use advertising cookies, tracking pixels, cross-site
          trackers or analytics profiling on this site.
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">3. Legal basis</h2>
        <p>
          The local storage we use is strictly necessary to provide the booking functionality
          you requested (§ 25(2) TDDDG / GDPR Art. 6(1)(b) and (f)). No prior consent is
          required for strictly necessary storage. Anything beyond that would only be used
          with your explicit consent.
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">4. Third-party services</h2>
        <ul>
          <li>
            <strong>Stripe</strong> — if you pay online, Stripe may set its own cookies for
            fraud prevention and payment processing. See stripe.com/cookies-policy.
          </li>
          <li>
            <strong>Supabase / Lovable Cloud</strong> — used to store your booking on secure
            EU-based infrastructure. No tracking cookies are set on your browser by this
            service.
          </li>
        </ul>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">5. How to clear cookies & local storage</h2>
        <p>
          You can delete cookies and local storage at any time via your browser settings
          (usually under "Privacy" or "Site data"). Clearing the local storage for this site
          will reset the booking-calendar unlock form; you'll be asked for your contact details
          again next time.
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">6. Changes</h2>
        <p>
          We may update this notice if we introduce new tools. The current version is always
          available on this page.
        </p>

        <h2 className="font-display text-2xl uppercase mt-10 mb-3">7. Contact</h2>
        <p>
          Questions about cookies or your privacy? Email{" "}
          <strong>chaouchyoucef@yahoo.com</strong>.
        </p>
      </article>
    </main>
  );
}
