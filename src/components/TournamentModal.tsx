import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getTournamentSpots, joinTournament } from "@/lib/bookings.functions";

export const TOURNAMENT_CAPACITY = 24;

const POINTS = [
  "⚡ First come, first booked!",
  "🌍 Open to every level",
  "💪 Tournament with lots of drills in 4 or 6-player teams",
  "🎁 Gift for the winners",
  "🎶 Music + 🍿 snacks included",
  "👥 Minimum 16 players – Maximum 24 players",
  "🕐 15:00 – 18:00 (Berlin time)",
  "💰 €25 per player",
  "✅ €7 off for Urban Sports Club and Wellhub members (final price: €18)",
  "💳 Payment required in advance before 15 January 2027",
];

export function useTournamentSpots() {
  const [players, setPlayers] = useState<{ first_name: string; last_initial: string }[]>([]);
  const refresh = () => getTournamentSpots().then(setPlayers).catch(() => {});
  useEffect(() => {
    refresh();
  }, []);
  return { players, left: TOURNAMENT_CAPACITY - players.length, refresh };
}

export function TournamentModal({ onClose }: { onClose: () => void }) {
  const { left, refresh } = useTournamentSpots();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [partner, setPartner] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      const meta = data.session?.user.user_metadata as { first_name?: string; last_name?: string } | undefined;
      if (meta?.first_name) setFirst(meta.first_name);
      if (meta?.last_name) setLast(meta.last_name);
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async () => {
    if (!first.trim() || !last.trim()) return toast.error("Please enter your name.");
    setBusy(true);
    try {
      const res = await joinTournament({ data: { first_name: first, last_name: last, partner_discount: partner } });
      if (res.ok) {
        setDone(res.price_cents ?? 2500);
        refresh();
      } else toast.error(res.error === "full" ? "The tournament is full." : res.error === "already" ? "You are already registered 🎾" : "Could not register.");
    } catch {
      toast.error("Could not register — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Tournament">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
      <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border-2 border-destructive/40 bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-ink/5 text-lg font-bold">×</button>
        <h2 className="pr-12 font-display text-2xl uppercase leading-tight text-destructive sm:text-3xl">
          <span className="inline-block animate-bounce">🎾</span> Tournament – 30 January 2027 <span className="inline-block animate-pulse">🔥</span>
        </h2>
        <div className="mt-3 inline-flex rounded-full bg-destructive px-3 py-1 text-sm font-bold text-destructive-foreground">
          {Math.max(0, left)}/{TOURNAMENT_CAPACITY} spots left
        </div>
        <ul className="mt-4 grid gap-2 text-base leading-snug">
          {POINTS.map((p) => <li key={p}>{p}</li>)}
        </ul>

        {done !== null ? (
          <div className="mt-5 rounded-2xl border-2 border-ink/10 bg-muted p-4 text-base">
            <p className="font-bold">You're in! 🎉 €{done / 100} per player.</p>
            <p className="mt-2">💳 Please pay before 15 January 2027 by bank transfer: <b>Youcef Chaouch</b> · IBAN <b className="break-all">DE84 1001 1001 2694 8756 79</b> · reference “{first} {last} Tournament”. A confirmation email is on its way.</p>
          </div>
        ) : signedIn === false ? (
          <Link to="/auth" className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-destructive px-5 text-lg font-bold text-destructive-foreground">
            Sign in to join the Tournament 🎾
          </Link>
        ) : (
          <div className="mt-5 grid gap-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" maxLength={60} className="min-h-12 rounded-xl border-2 border-ink/15 bg-background px-3 text-base" />
              <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" maxLength={60} className="min-h-12 rounded-xl border-2 border-ink/15 bg-background px-3 text-base" />
            </div>
            <label className="flex min-h-11 items-center gap-3 text-base">
              <input type="checkbox" checked={partner} onChange={(e) => setPartner(e.target.checked)} className="h-5 w-5" />
              I'm an Urban Sports Club / Wellhub member (€18)
            </label>
            <button type="button" onClick={submit} disabled={busy || left <= 0}
              className="min-h-12 w-full rounded-full bg-destructive px-5 text-lg font-bold text-destructive-foreground disabled:opacity-50">
              {busy ? "Joining…" : left <= 0 ? "Sold out" : "Join the Tournament 🎾"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
