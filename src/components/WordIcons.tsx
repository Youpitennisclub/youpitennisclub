import { Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

/** Envelope mark placed next to every visible "email" wording on the site. */
export function EmailIcon({ className = "" }: { className?: string }) {
  return (
    <Mail
      aria-hidden="true"
      size={14}
      strokeWidth={2.2}
      className={`inline-block h-[1em] w-[1em] shrink-0 align-[-0.125em] ${className}`}
    />
  );
}

// Matches the standalone words "email", "e-mail" and "WhatsApp" (not "emailed").
const WORD = /\b(e-?mail|whatsapp)\b/gi;

/**
 * Renders plain text with the WhatsApp glyph in front of every "WhatsApp" and the
 * envelope glyph in front of every "email" — the wording itself is never changed.
 */
export function WithIcons({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(WORD);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        const isWhatsApp = /whatsapp/i.test(part);
        return (
          <span key={i} className="whitespace-nowrap">
            {isWhatsApp ? <WhatsAppIcon className="text-[#25D366]" /> : <EmailIcon className="text-clay" />}{" "}
            {part}
          </span>
        );
      })}
    </span>
  );
}
