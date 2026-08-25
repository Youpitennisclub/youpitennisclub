import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Youpi Tennis Club Berlin" },
      {
        name: "description",
        content:
          "Contact Youpi Tennis Club in Berlin: write a message about lessons, groups or events, or reach us on WhatsApp at +49 176 45689622.",
      },
      { property: "og:title", content: "Contact — Youpi Tennis Club Berlin" },
      {
        property: "og:description",
        content: "Send a message about tennis lessons in Berlin, or write on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://youpitennisclub.com/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://youpitennisclub.com/contact" }],
  }),
  component: ContactPage,
});

const EMAIL = "chaouchyoucef@yahoo.com";
const PHONE = "+4917645689622";

function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = href;
  };

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-2 font-display text-xl sm:text-2xl">
            <span className="inline-block w-7 h-7 shrink-0 rounded-full bg-ball ball-spin shadow-inner" />
            <span className="truncate uppercase">Youpi Tennis Club</span>
          </Link>
          <Link
            to="/"
            className="shrink-0 px-4 py-2.5 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ball/40 transition"
          >
            ← Back
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-16 text-left">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase mb-6 break-words">
          Contact
        </h1>
        <p className="text-muted-foreground mb-8">
          Questions about lessons, groups, events or the club? Write me a message — I answer
          quickly.
        </p>

        <div className="mb-10 p-6 rounded-3xl bg-card border-2 border-ink/10">
          <div className="font-display text-xl uppercase mb-2">Phone</div>
          <a href={`tel:${PHONE}`} className="text-lg font-semibold hover:text-clay transition">
            +49 176 45689622
          </a>
          <p className="text-sm text-muted-foreground mt-1">WhatsApp preferable 💬</p>
          <div className="font-display text-xl uppercase mt-6 mb-2">Email</div>
          <a href={`mailto:${EMAIL}`} className="hover:text-clay transition break-all">
            {EMAIL}
          </a>
        </div>

        <form onSubmit={send} className="grid gap-3 p-6 md:p-8 rounded-3xl bg-card border-2 border-ink/10">
          <label className="text-sm font-semibold" htmlFor="subject">
            Subject
          </label>
          <input
            id="subject"
            required
            maxLength={120}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Group lesson for 2 friends"
            className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
          />
          <label className="text-sm font-semibold mt-2" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            required
            rows={6}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me about your level, your goals and when you'd like to play."
            className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition resize-y"
          />
          <button
            type="submit"
            className="mt-3 px-7 py-4 rounded-2xl bg-violet text-violet-foreground font-semibold hover:opacity-90 transition"
          >
            Send message ✉️
          </button>
        </form>
      </section>
    </main>
  );
}
