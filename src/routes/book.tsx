import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book your tennis session — Youpi Multi Culti Tennis Berlin" },
      {
        name: "description",
        content:
          "Reserve your tennis session in Berlin with Youpi. Pick a date, choose your level, and get an instant confirmation.",
      },
      { property: "og:title", content: "Book a tennis session in Berlin — Youpi" },
      {
        property: "og:description",
        content: "Book your tennis session in a few clicks. Beginner to advanced, EN/FR/DE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

type Level = "beginner" | "intermediate" | "advanced";
const MAX_PER_SLOT = 6;
const GATE_UNTIL = new Date("2026-10-15T00:00:00");
const GATE_STORAGE_KEY = "youpi_visitor_v1";

type PublicBooking = {
  starts_at: string;
  level: Level;
  first_name: string;
  last_initials: string;
};

type Slot = { start: Date; duration: number };

// Mon-Fri: 17:00 (60 min), 18:00 (90 min), 19:30 (90 min)
// Sat: 10:00 / 11:30 / 13:00 / 14:30 (90 min each)
function buildSlotsForDate(date: Date): Slot[] {
  const day = date.getDay();
  const defs: [number, number, number][] =
    day === 0
      ? []
      : day === 6
        ? [
            [10, 0, 90],
            [11, 30, 90],
            [13, 0, 90],
            [14, 30, 90],
          ]
        : [
            [17, 0, 60],
            [18, 0, 90],
            [19, 30, 90],
          ];
  return defs.map(([h, m, duration]) => {
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return { start: d, duration };
  });
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmtDay(d: Date, locale = "en-GB") {
  return d.toLocaleDateString(locale, { weekday: "short", day: "2-digit", month: "short" });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function BookPage() {
  const today = startOfDay(new Date());
  const [weekStart, setWeekStart] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookings, setBookings] = useState<PublicBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<Level>("beginner");

  // Gate: until mid-October 2026, visitors must submit their contact info to unlock the calendar.
  const gateActive = Date.now() < GATE_UNTIL.getTime();
  const [unlocked, setUnlocked] = useState(!gateActive);
  const [gateFirst, setGateFirst] = useState("");
  const [gateLast, setGateLast] = useState("");
  const [gateEmail, setGateEmail] = useState("");
  const [gatePhone, setGatePhone] = useState("");

  useEffect(() => {
    if (!gateActive) return;
    try {
      const raw = localStorage.getItem(GATE_STORAGE_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (v?.email) {
          setUnlocked(true);
          setFirstName(v.first_name ?? "");
          setLastName(v.last_name ?? "");
          setEmail(v.email ?? "");
          setPhone(v.phone ?? "");
        }
      }
    } catch {
      /* ignore */
    }
  }, [gateActive]);

  const unlock = (e: React.FormEvent) => {
    e.preventDefault();
    const v = {
      first_name: gateFirst.trim(),
      last_name: gateLast.trim(),
      email: gateEmail.trim(),
      phone: gatePhone.trim(),
    };
    if (!v.first_name || !v.last_name || !v.email || !v.phone) return;
    localStorage.setItem(GATE_STORAGE_KEY, JSON.stringify(v));
    setFirstName(v.first_name);
    setLastName(v.last_name);
    setEmail(v.email);
    setPhone(v.phone);
    setUnlocked(true);
    toast.success("Welcome! Calendar unlocked 🎾");
  };

  const SUMMER_END = new Date("2026-10-15T00:00:00");
  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      if (d.getTime() >= SUMMER_END.getTime()) break;
      arr.push(d);
    }
    return arr;
  }, [weekStart]);

  const loadBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_public_bookings", {
      from_ts: today.toISOString(),
    });
    if (error) {
      console.error(error);
      toast.error("Couldn't load the schedule. Try again in a moment.");
    } else {
      setBookings((data as PublicBooking[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!unlocked) return;
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  const participantsFor = (slot: Slot) =>
    bookings.filter((b) => new Date(b.starts_at).getTime() === slot.start.getTime());

  const isFull = (slot: Slot) => participantsFor(slot).length >= MAX_PER_SLOT;
  const isPast = (slot: Slot) => slot.start.getTime() <= Date.now();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      starts_at: selectedSlot.start.toISOString(),
      level,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(
        error.message.includes("fully booked")
          ? "Sorry, this slot just got fully booked."
          : "Something went wrong. Please try again.",
      );
      return;
    }
    toast.success("🎾 Your session is booked! We'll be in touch shortly.");
    setSelectedSlot(null);
    await loadBookings();
  };

  return (
    <main className="relative min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl">
            <span
              className="inline-block w-7 h-7 rounded-full bg-ball ball-spin shadow-inner"
              style={{ boxShadow: "inset -4px -4px 0 oklch(0.78 0.18 115)" }}
            />
            YOUPI<span className="text-clay">.</span>
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ball/40 transition"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ball/40 border border-ink/10 text-xs font-semibold uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-court animate-pulse" />
          60 & 90-minute sessions · Berlin
        </div>
        <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-display uppercase leading-none">
          Book your <span className="text-clay">tennis session</span>.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Pick a slot, tell me your level, and you're in. Mon–Fri:{" "}
          <b className="text-ink">17:00 (60 min)</b>, <b className="text-ink">18:00</b> &{" "}
          <b className="text-ink">19:30</b> (90 min). Saturday{" "}
          <b className="text-ink">10 AM–4 PM</b>.
        </p>
      </section>

      {/* GATE */}
      {!unlocked ? (
        <section className="max-w-xl mx-auto px-6 pb-24">
          <div className="rounded-3xl bg-card border-2 border-ink p-6 md:p-8 shadow-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ball text-ink text-xs font-semibold uppercase tracking-widest mb-4">
              🔒 Early access
            </div>
            <h2 className="font-display text-3xl uppercase mb-2">Unlock the calendar</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Until mid-October, the calendar is reserved for players who introduce themselves
              first. Leave your contact and get instant access to all available slots.
            </p>
            <form onSubmit={unlock} className="grid gap-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  required
                  maxLength={60}
                  value={gateFirst}
                  onChange={(e) => setGateFirst(e.target.value)}
                  placeholder="First name"
                  className="px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                />
                <input
                  required
                  maxLength={60}
                  value={gateLast}
                  onChange={(e) => setGateLast(e.target.value)}
                  placeholder="Last name"
                  className="px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                />
              </div>
              <input
                required
                type="email"
                maxLength={120}
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                placeholder="Email address"
                className="px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
              />
              <input
                required
                type="tel"
                maxLength={30}
                value={gatePhone}
                onChange={(e) => setGatePhone(e.target.value)}
                placeholder="Phone number"
                className="px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
              />
              <button
                type="submit"
                className="mt-2 px-7 py-4 rounded-2xl bg-court text-primary-foreground font-semibold text-lg hover:bg-ink transition"
              >
                Unlock calendar 🔓
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Your info is used only to contact you about your booking.
              </p>
            </form>
          </div>
        </section>
      ) : (
        <>
          {/* CALENDAR */}
          <section className="max-w-6xl mx-auto px-6 pb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl uppercase">Available slots <span className="text-muted-foreground text-base normal-case">(Summer season)</span></h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const d = new Date(weekStart);
                    d.setDate(d.getDate() - 7);
                    if (d < today) return;
                    setWeekStart(d);
                  }}
                  className="px-4 py-2 rounded-full border-2 border-ink/15 text-sm font-semibold disabled:opacity-40 hover:bg-ball/40 transition"
                  disabled={weekStart.getTime() <= today.getTime()}
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    const d = new Date(weekStart);
                    d.setDate(d.getDate() + 7);
                    setWeekStart(d);
                  }}
                  className="px-4 py-2 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ball/40 transition"
                >
                  Next →
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-muted-foreground">Loading schedule…</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {days.map((day) => {
                  const slots = buildSlotsForDate(day);
                  const dayLabel = fmtDay(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={day.toISOString()}
                      className="rounded-2xl border-2 border-ink/10 bg-card overflow-hidden"
                    >
                      <div
                        className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${
                          isToday ? "bg-ball text-ink" : "bg-ink/5 text-ink"
                        }`}
                      >
                        {dayLabel}
                      </div>
                      <div className="p-2 flex flex-col gap-1.5 min-h-24">
                        {slots.length === 0 ? (
                          <div className="text-xs text-muted-foreground px-2 py-3">Rest day</div>
                        ) : (
                          slots.map((slot) => {
                            const parts = participantsFor(slot);
                            const full = isFull(slot);
                            const past = isPast(slot);
                            const selected =
                              selectedSlot?.start.getTime() === slot.start.getTime();
                            return (
                              <button
                                key={slot.start.toISOString()}
                                onClick={() => setSelectedSlot(slot)}
                                disabled={full || past}
                                className={`text-left rounded-xl px-3 py-2 text-sm font-semibold transition border-2 ${
                                  past
                                    ? "opacity-40 line-through cursor-not-allowed border-transparent"
                                    : full
                                      ? "bg-ink/5 text-muted-foreground line-through cursor-not-allowed border-transparent"
                                      : selected
                                        ? "bg-court text-primary-foreground border-court"
                                        : "bg-background hover:bg-ball/40 border-ink/10"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>
                                    {fmtTime(slot.start)}
                                    <span className="ml-1 text-[10px] font-normal opacity-70">
                                      · {slot.duration}m
                                    </span>
                                  </span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                      selected ? "bg-primary-foreground/20" : "bg-ink/10"
                                    }`}
                                  >
                                    {parts.length}/{MAX_PER_SLOT}
                                  </span>
                                </div>
                                {parts.length > 0 && !past && (
                                  <div
                                    className={`mt-1 text-[10px] font-normal truncate ${
                                      selected ? "text-primary-foreground/80" : "text-muted-foreground"
                                    }`}
                                  >
                                    {parts
                                      .map((p) => `${p.first_name} ${p.last_initials}.`)
                                      .join(", ")}
                                  </div>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* FORM */}
          <section className="max-w-2xl mx-auto px-6 pb-24">
            <div className="rounded-3xl bg-card border-2 border-ink/10 p-6 md:p-8 shadow-lg">
              <h3 className="font-display text-2xl uppercase mb-1">Your details</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {selectedSlot ? (
                  <>
                    Selected:{" "}
                    <b className="text-ink">
                      {fmtDay(selectedSlot.start, "en-GB")} · {fmtTime(selectedSlot.start)}
                    </b>{" "}
                    ({selectedSlot.duration} min)
                  </>
                ) : (
                  "Pick a slot in the calendar above to continue."
                )}
              </p>

              <form onSubmit={submit} className="grid gap-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    required
                    maxLength={60}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                  />
                  <input
                    required
                    maxLength={60}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                  />
                </div>
                <input
                  required
                  type="email"
                  maxLength={120}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                />
                <input
                  required
                  type="tel"
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                />

                <fieldset className="mt-2">
                  <legend className="text-sm font-semibold mb-2">Your tennis level</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(["beginner", "intermediate", "advanced"] as Level[]).map((lv) => (
                      <button
                        type="button"
                        key={lv}
                        onClick={() => setLevel(lv)}
                        className={`px-3 py-3 rounded-2xl border-2 text-sm font-semibold capitalize transition ${
                          level === lv
                            ? "bg-court text-primary-foreground border-court"
                            : "bg-background border-ink/10 hover:bg-ball/40"
                        }`}
                      >
                        {lv}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={!selectedSlot || submitting}
                  className="mt-4 px-7 py-5 rounded-2xl bg-court text-primary-foreground font-semibold text-lg hover:bg-ink transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Booking…" : "Book your tennis session 🎾"}
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  Free cancellation up to 24h before. Rain policy: 50% refund or reschedule.
                </p>
              </form>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
