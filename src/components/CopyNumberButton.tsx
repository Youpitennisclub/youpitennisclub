import { useEffect, useRef, useState } from "react";

export const PHONE_DISPLAY = "+49 176 45689622";
export const PHONE_PLAIN = "+4917645689622";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall back to the legacy path below
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.left = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Small pill button that copies the coach's phone number, for the case where
 * WhatsApp does not open on the visitor's device.
 */
export function CopyNumberButton({
  className = "",
  label = "Copy number",
  hint,
  value = PHONE_DISPLAY,
}: {
  className?: string;
  label?: string;
  hint?: string;
  value?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const run = async () => {
    const ok = await copyToClipboard(value);
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2500);
  };

  const text =
    state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label;

  return (
    <span className={`inline-flex min-w-0 flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={run}
        aria-label={`Copy ${value}`}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition ${
          state === "copied"
            ? "border-clay text-clay bg-ball/30"
            : "border-ink/15 hover:bg-ball/40"
        }`}
      >
        {state === "copied" ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
        )}
        {text}
      </button>
      <span aria-live="polite" className="sr-only">
        {state === "copied" ? `${value} copied` : ""}
      </span>
      {hint && state !== "copied" && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
    </span>
  );
}
