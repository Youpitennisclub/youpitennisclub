import { Link } from "@tanstack/react-router";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" aria-label="Youpi Tennis Club home" className="flex min-w-0 items-center gap-2 font-display text-base uppercase leading-tight sm:text-xl">
          <span className="h-6 w-6 shrink-0 rounded-full bg-ball shadow-inner" />
          <span translate="no" className="notranslate sm:hidden">YTC</span>
          <span translate="no" className="notranslate hidden sm:inline">Youpi Tennis Club</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <Link to="/book" className="rounded-md bg-violet px-3 py-2 text-xs font-semibold text-violet-foreground transition hover:opacity-90 sm:px-4 sm:text-sm">
            Book
          </Link>
        </div>
      </div>
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl gap-5 overflow-x-auto border-t border-border px-4 py-2.5 text-xs font-semibold [scrollbar-width:none] sm:px-6 sm:text-sm [&::-webkit-scrollbar]:hidden">
        <Link to="/" className="shrink-0 transition hover:text-clay">Winter season</Link>
        <Link to="/membership" className="shrink-0 transition hover:text-clay">Membership</Link>
        <Link to="/tournaments" className="shrink-0 transition hover:text-clay">Tournaments</Link>
        <Link to="/past-events" className="shrink-0 transition hover:text-clay">Past events</Link>
        <Link to="/contact" className="shrink-0 transition hover:text-clay">Contact</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-10 bg-ink text-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div translate="no" className="notranslate font-display text-xl uppercase">Youpi Tennis Club</div>
        <div className="flex flex-wrap gap-6 text-sm text-background/70">
          <Link to="/contact" className="transition hover:text-ball">Contact</Link>
          <Link to="/privacy" className="transition hover:text-ball">Privacy</Link>
          <Link to="/cookies" className="transition hover:text-ball">Cookies</Link>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-background/10 px-6 py-5 text-xs text-background/40">
        © {new Date().getFullYear()} Youpi Tennis Club · Made with 🎾 in Berlin
      </div>
    </footer>
  );
}