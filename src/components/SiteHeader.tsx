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
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-display text-base uppercase leading-tight sm:text-2xl">
          <span className="ball-spin inline-block h-7 w-7 shrink-0 rounded-full bg-ball shadow-inner" />
          <span translate="no" className="notranslate min-w-0 break-words">Youpi Tennis Club</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="transition hover:text-clay"
              activeProps={{ className: "text-clay" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
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
            className="rounded-full lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-background px-4 py-4 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-4 py-3 font-semibold transition hover:bg-muted hover:text-clay"
                activeProps={{ className: "bg-muted text-clay" }}
                activeOptions={{ exact: item.to === "/" }}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/book"
              className="mt-2 rounded-md bg-violet px-4 py-3 text-center font-semibold text-violet-foreground"
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