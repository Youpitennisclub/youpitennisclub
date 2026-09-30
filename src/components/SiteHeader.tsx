import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/membership", label: "Membership Club 2027" },
  { to: "/about", label: "About me" },
  { to: "/tennis-events", label: "Tennis events" },
  { to: "/summer-season", label: "Summer saison" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink/10 bg-background/95 backdrop-blur-md shadow-[0_1px_0_0] shadow-ink/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-display text-base uppercase leading-tight sm:text-2xl">
          <span className="ball-spin inline-block h-7 w-7 shrink-0 rounded-full bg-ball shadow-inner sm:h-8 sm:w-8" />
          <span translate="no" className="notranslate min-w-0 break-words">Youpi Tennis Club</span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-5 text-[13px] font-bold uppercase tracking-wider lg:flex xl:gap-7" aria-label="Main navigation">

          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative whitespace-nowrap py-1 transition hover:text-clay"
              activeProps={{ className: "text-clay [&>span]:w-full" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 h-[3px] w-0 rounded-full bg-clay transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>


        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <Link
            to="/book"
            className="hidden rounded-full bg-violet px-5 py-2.5 text-sm font-semibold text-violet-foreground transition hover:opacity-90 sm:inline-flex"
          >
            Book
          </Link>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-2 border-ink/15 bg-ink text-background shadow-sm transition hover:bg-clay hover:border-clay lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" strokeWidth={2.75} /> : <Menu className="h-5 w-5" strokeWidth={2.75} />}
          </Button>

        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-ink/10 bg-background px-4 py-4 shadow-lg lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-background px-4 py-3.5 text-[15px] font-bold uppercase tracking-wide transition hover:bg-muted hover:text-clay"
                activeProps={{ className: "bg-muted text-clay border-clay/40" }}
                activeOptions={{ exact: item.to === "/" }}
                onClick={() => setMenuOpen(false)}
              >
                <span className="min-w-0 break-words">{item.label}</span>
                <span aria-hidden="true" className="shrink-0 text-clay/70">→</span>
              </Link>
            ))}
            <Link
              to="/book"
              className="mt-2 rounded-xl bg-violet px-4 py-4 text-center font-bold uppercase tracking-wide text-violet-foreground shadow-sm transition hover:opacity-90"
              onClick={() => setMenuOpen(false)}
            >
              Book your lesson
            </Link>
          </div>
        </nav>
      )}

    </header>
  );
}