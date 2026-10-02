// Official WhatsApp brand glyph (simplified). Brand logos keep their own colors,
// so this uses WhatsApp green regardless of the site palette.
import { useEffect, useState } from "react";

const WHATSAPP_MESSAGE =
  "Hi Youpi! I found you through your website and I'd like to know more about tennis lessons 🎾";

const ENCODED_MESSAGE = encodeURIComponent(WHATSAPP_MESSAGE);
const MOBILE_LINK = `https://wa.me/4917645689622?text=${ENCODED_MESSAGE}`;
const DESKTOP_LINK = `https://web.whatsapp.com/send?phone=4917645689622&text=${ENCODED_MESSAGE}`;

// Mobile: wa.me opens the WhatsApp app. Desktop: open WhatsApp Web directly
// (wa.me sometimes fails to redirect properly on desktop browsers).
// Default to the mobile link so SSR/first paint always has a working href,
// then switch to WhatsApp Web after hydration on desktop devices.
export function useWhatsAppLink(): string {
  const [link, setLink] = useState(MOBILE_LINK);
  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobile =
      /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
      // iPadOS reports itself as a Mac; detect it via touch support.
      (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    if (!isMobile) {
      setLink(DESKTOP_LINK);
    }
  }, []);
  return link;
}

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={`inline-block h-[1em] w-[1em] shrink-0 align-[-0.125em] ${className}`}
      fill="currentColor"
    >
      <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.257.59 4.463 1.713 6.408L3.2 28.8l6.574-1.683a12.75 12.75 0 0 0 6.229 1.598h.005c7.058 0 12.798-5.74 12.798-12.8 0-7.06-5.74-12.8-12.8-12.8h-.003Zm0 23.444h-.004a10.63 10.63 0 0 1-5.413-1.483l-.389-.23-3.9 1.02 1.04-3.802-.253-.392a10.62 10.62 0 0 1-1.632-5.677c0-5.88 4.786-10.665 10.67-10.665 2.85 0 5.526 1.111 7.54 3.126a10.594 10.594 0 0 1 3.124 7.544c-.002 5.882-4.789 10.659-10.783 10.659Zm5.855-7.988c-.32-.16-1.895-.935-2.188-1.042-.293-.107-.506-.16-.72.16-.213.32-.826 1.042-1.012 1.255-.187.213-.373.24-.693.08-.32-.16-1.35-.497-2.571-1.586-.95-.848-1.592-1.895-1.779-2.215-.186-.32-.02-.493.14-.652.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.718-1.73-.984-2.37-.26-.62-.522-.536-.718-.545-.186-.008-.4-.01-.613-.01a1.18 1.18 0 0 0-.852.4c-.293.32-1.118 1.092-1.118 2.663 0 1.571 1.145 3.089 1.305 3.302.16.213 2.252 3.438 5.456 4.821.762.329 1.358.525 1.823.672.766.244 1.462.21 2.013.127.614-.092 1.895-.774 2.161-1.522.267-.748.267-1.389.187-1.523-.08-.133-.293-.213-.613-.373Z" />
    </svg>
  );
}
