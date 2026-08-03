const LANGS: { code: string; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const onChange = (code: string) => {
    if (code === "en") return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const host = typeof window !== "undefined" ? window.location.host : "";
    // Opens the page translated into the chosen language.
    window.open(
      `https://translate.google.com/translate?sl=en&tl=${code}&u=${encodeURIComponent(url || host)}`,
      "_blank",
      "noopener",
    );
  };

  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-base leading-none" aria-hidden>
        🌐
      </span>
      <span className="sr-only">Choose language</span>
      <select
        defaultValue="en"
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[7.5rem] truncate rounded-full border-2 border-ink/15 bg-background px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-court"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
