import { useRef, useState } from "react";

/** Resizes the chosen picture client-side and returns a small data URL. */
async function toSmallDataUrl(file: File, max = 256): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.75);
}

export function PhotoPicker({
  value,
  onChange,
  label = "Add a photo (optional)",
  hint = "Makes the session more personal — other players see your picture next to your first name.",
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-ink/10 bg-background p-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-ink/15 bg-muted grid place-items-center text-xl"
        aria-label={label}
      >
        {value ? (
          <img src={value} alt="Your photo" className="h-full w-full object-cover" />
        ) : (
          <span>📷</span>
        )}
      </button>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{busy ? "Loading photo…" : label}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="mt-1 text-xs font-semibold text-clay underline"
          >
            Remove photo
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onChange(await toSmallDataUrl(file));
          } catch {
            onChange(null);
          }
          setBusy(false);
        }}
      />
    </div>
  );
}
