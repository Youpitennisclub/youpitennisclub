import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";

// Flag images come from a CDN so they render identically on every OS/browser.
const flagUrl = (code: string) => `https://flagcdn.com/w40/${code}.png`;

const LANGS: { code: string; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: flagUrl("gb") },
  { code: "de", label: "Deutsch", flag: flagUrl("de") },
  { code: "fr", label: "Français", flag: flagUrl("fr") },
  { code: "ru", label: "Русский", flag: flagUrl("ru") },
  { code: "es", label: "Español", flag: flagUrl("es") },
  { code: "pt", label: "Português", flag: flagUrl("pt") },
  { code: "tr", label: "Türkçe", flag: flagUrl("tr") },
  { code: "pl", label: "Polski", flag: flagUrl("pl") },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(LANGS[0]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onChange = (lang: (typeof LANGS)[number]) => {
    setOpen(false);
    setCurrent(lang);
    if (lang.code === "en" || typeof window === "undefined") return;
    const { hostname, pathname, search, hash } = window.location;
    // Google's translation proxy: works on any public page, keeps the current path.
    const host = hostname.replace(/-/g, "--").replace(/\./g, "-");
    const url =
      `https://${host}.translate.goog${pathname}${search}${search ? "&" : "?"}` +
      `_x_tr_sl=en&_x_tr_tl=${lang.code}&_x_tr_hl=${lang.code}${hash}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Choose language, current: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 max-w-[8.5rem] truncate rounded-full border-2 border-ink/15 bg-background px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-clay hover:border-clay/50 transition-colors"
      >
        <Globe className="h-4 w-4 shrink-0 text-ink" strokeWidth={2.25} aria-hidden />
        <img
          src={current.flag}
          alt=""
          width={16}
          height={12}
          loading="lazy"
          className="h-3 w-4 shrink-0 rounded-[2px] object-cover"
        />
        <span className="truncate">{current.code.toUpperCase()} · {current.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 z-50 mt-1.5 min-w-[10.5rem] overflow-hidden rounded-xl border border-ink/10 bg-background py-1 shadow-lg"
        >
          {LANGS.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === current.code}>
              <button
                type="button"
                onClick={() => onChange(l)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-muted ${
                  l.code === current.code ? "text-clay" : "text-ink"
                }`}
              >
                <img
                  src={l.flag}
                  alt=""
                  width={20}
                  height={15}
                  loading="lazy"
                  className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-ink/10"
                />
                <span className="truncate">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
