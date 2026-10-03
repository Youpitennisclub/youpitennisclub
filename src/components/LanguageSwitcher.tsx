import { Globe } from "lucide-react";

const LANGS: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "tr", label: "Türkçe" },
  { code: "pl", label: "Polski" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const onChange = (code: string) => {
    if (code === "en" || typeof window === "undefined") return;
    const { hostname, pathname, search, hash } = window.location;
    // Google's translation proxy: works on any public page, keeps the current path.
    const host = hostname.replace(/-/g, "--").replace(/\./g, "-");
    const url =
      `https://${host}.translate.goog${pathname}${search}${search ? "&" : "?"}` +
      `_x_tr_sl=en&_x_tr_tl=${code}&_x_tr_hl=${code}${hash}`;
    window.open(url, "_blank", "noopener");
  };


  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="h-4 w-4 shrink-0 text-ink" strokeWidth={2.25} aria-hidden />
      <span className="sr-only">Choose language</span>
      <select
        defaultValue="en"
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[6.75rem] min-[380px]:max-w-[7.5rem] truncate rounded-full border-2 border-ink/15 bg-background px-2 min-[380px]:px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-clay"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.code.toUpperCase()} · {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
