import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminAdjustCredits, adminListStudents } from "@/lib/admin.functions";

type Student = { id: string; email: string; name: string; balance_cents: number };

/** Coach-only panel: add the €200 pack (or adjust) on a student's credit balance. */
export function AdminCredits() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [custom, setCustom] = useState<Record<string, string>>({});

  const load = () =>
    adminListStudents()
      .then((r) => setStudents(r))
      .catch(() => setDenied(true));
  useEffect(() => {
    load();
  }, []);

  const adjust = async (s: Student, cents: number, note?: string) => {
    if (!cents) return;
    if (cents < 0 && !window.confirm(`Remove €${(-cents / 100).toFixed(2)} from ${s.name || s.email}?`)) return;
    setBusy(s.id);
    try {
      const r = await adminAdjustCredits({ data: { userId: s.id, amountCents: cents, note } });
      toast.success(`${s.name || s.email}: new balance €${(r.balance_cents / 100).toFixed(2)}`);
      setCustom((c) => ({ ...c, [s.id]: "" }));
      await load();
    } catch {
      toast.error("Couldn't update the balance.");
    } finally {
      setBusy(null);
    }
  };

  const list = (students ?? []).filter((s) =>
    `${s.name} ${s.email}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="mt-8 rounded-3xl bg-card border-2 border-ink p-5 sm:p-7">
      <h3 className="font-display text-xl sm:text-2xl uppercase">Coach · Student credits</h3>
      {denied ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Open your secret admin link once on this device to manage credits.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            When a bank transfer arrives, press “+ €200 pack” on the student. Use the field to add or remove any amount (e.g. -20).
          </p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="mt-4 w-full rounded-full border-2 border-ink/15 bg-background px-4 py-2.5 text-sm"
          />
          {!students ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {list.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink/10 px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-semibold break-words">{s.name || "—"}</div>
                    <div className="text-xs text-muted-foreground break-all">{s.email}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg">€{(s.balance_cents / 100).toFixed(2)}</span>
                    <button
                      type="button"
                      disabled={busy === s.id}
                      onClick={() => adjust(s, 20000, "€200 Credit Pack — bank transfer received")}
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40"
                    >
                      + €200 pack
                    </button>
                    <input
                      inputMode="decimal"
                      value={custom[s.id] ?? ""}
                      onChange={(e) => setCustom((c) => ({ ...c, [s.id]: e.target.value }))}
                      placeholder="€ ±"
                      className="w-20 rounded-full border-2 border-ink/15 bg-background px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={busy === s.id || !custom[s.id]}
                      onClick={() => adjust(s, Math.round(Number(String(custom[s.id]).replace(",", ".")) * 100) || 0)}
                      className="px-4 py-2 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ball/40 disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                </li>
              ))}
              {list.length === 0 && <li className="text-sm text-muted-foreground">No student found.</li>}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
