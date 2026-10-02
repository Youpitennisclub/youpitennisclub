# Architecture

- Shared public navigation lives in `src/components/SiteHeader.tsx` so desktop and mobile menus stay consistent across content routes.
- Every WhatsApp link keeps its plain `wa.me` anchor (`href`, `target="_blank"`, `rel="noopener"`) plus `handleWhatsAppClick` from `src/components/WhatsAppIcon.tsx`: new tab when allowed, else top-frame navigation, else an explanatory toast — because the preview iframe blocks new tabs and WhatsApp's pages refuse iframes, which made plain anchors silently dead there.