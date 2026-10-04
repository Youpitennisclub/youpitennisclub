# Architecture

- Render nationality flags as CDN-backed image assets rather than emoji or country-code text so Chrome displays them consistently across operating systems.

- Shared public navigation lives in `src/components/SiteHeader.tsx` so desktop and mobile menus stay consistent across content routes.
- Every WhatsApp link keeps its plain `wa.me` anchor (`href`, `target="_blank"`, `rel="noopener"`) plus `handleWhatsAppClick` from `src/components/WhatsAppIcon.tsx`: new tab when allowed, else top-frame navigation, else an explanatory toast — because the preview iframe blocks new tabs and WhatsApp's pages refuse iframes, which made plain anchors silently dead there.
- Site feedback is split: `FeedbackSection` (home page) renders only the intro plus the Google review card and a link; the review form and the published reviews live in `FeedbackBoard` on the `/leave-a-review` route — because the home page must stay short and reviews now have their own menu entry.
- The desktop nav is `shrink-0 text-xs gap-4` and the logo text is `xl:whitespace-nowrap`: the header is capped at `max-w-7xl` (1248px of inner width), so with seven menu items any larger nav squeezes the logo into a mid-word wrap or pushes "Contact" under the language selector.
