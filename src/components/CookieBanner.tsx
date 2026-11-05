import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "youpi_cookie_consent";

/** First-visit cookie popup; the choice is remembered in local storage. */
export function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);
  if (!open) return null;
  const choose = (v: "accepted" | "refused") => {
    localStorage.setItem(KEY, v);
    setOpen(false);
  };
  return (
    <div role="dialog" aria-label="Cookies" className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-xl rounded-2xl border-2 border-ink/10 bg-background p-4 text-sm text-ink shadow-lg">
      <p>
        🍪 We use cookies to collect anonymous statistical data via Google Analytics, to improve the site.{" "}
        <Link to="/cookies" className="font-semibold underline">Cookies notice</Link>
      </p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <button onClick={() => choose("refused")} className="rounded-full border border-ink/20 px-4 py-2 font-semibold">Refuse</button>
        <button onClick={() => choose("accepted")} className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground">Accept</button>
      </div>
    </div>
  );
}
