import type { ReactNode } from "react";

// The yellow band that holds the partner marks. The two-logo layout is the default;
// a single mark (a wordmark or one logo) passes "grid-cols-1" instead.
const BAND_BASE =
  "mx-auto grid w-fit max-w-full items-center gap-2 rounded-xl border border-ink/10 bg-ball/40 px-2.5 py-2 md:gap-3 md:px-3.5 md:py-3 lg:mx-0 lg:w-auto lg:gap-4 lg:px-5 lg:py-4";
const TWO_LOGO_COLS = "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]";

/**
 * Partner benefit bubble on the home page: partner marks in a yellow band on the left,
 * the discount wording on the right. One design for every partner
 * (Wellhub + Urban Sports Club, Epassi …) so the bubbles always match each other.
 */
export function PartnerBubble({
  band,
  bandClass = TWO_LOGO_COLS,
  headline,
  note,
  pill,
}: {
  band: ReactNode;
  bandClass?: string;
  headline: string;
  note: string;
  pill: string;
}) {
  return (
    <article className="mx-auto mt-6 w-full max-w-md md:max-w-lg lg:w-fit lg:max-w-4xl rounded-2xl bg-background text-ink py-4 md:py-5 lg:py-6 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:px-[max(1.25rem,env(safe-area-inset-left))] md:pr-[max(1.25rem,env(safe-area-inset-right))] lg:px-[max(1.5rem,env(safe-area-inset-left))] lg:pr-[max(1.5rem,env(safe-area-inset-right))] border-2 border-pink/40">
      <div className="flex flex-col gap-2 md:gap-3 lg:flex-row lg:items-center lg:gap-6">
        <div className={`${BAND_BASE} ${bandClass}`}>{band}</div>
        <div className="min-w-0 text-center lg:text-left">
          <div className="font-display text-sm uppercase text-clay break-words md:text-base lg:text-lg">
            {headline} <span aria-hidden="true">🎾</span>
          </div>
          <p className="mt-1 text-xs text-ink/70 break-words md:text-[13px] lg:whitespace-nowrap">{note}</p>
          <div className="mt-1.5 inline-flex items-center rounded-full border border-destructive/25 bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-destructive">
            {pill}
          </div>
        </div>
      </div>
    </article>
  );
}
