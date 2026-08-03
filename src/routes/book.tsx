import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book your tennis session — Youpi Tennis Club Berlin" },
      {
        name: "description",
        content:
          "Reserve your tennis session in Berlin with Youpi Tennis Club. Pick a date, choose your level, and get an instant confirmation.",
      },
      { property: "og:title", content: "Book a tennis session in Berlin — Youpi Tennis Club" },
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
/** "open" = mixed slot, no level defined */
type SlotLevel = Level | "open";

const MAX_PER_SLOT = 6;
const GATE_UNTIL = new Date("2026-10-15T00:00:00");
const GATE_STORAGE_KEY = "youpi_visitor_v1";

/* =========================================================================
   ADMIN CONFIG — edit the group names, the daily level rotation and the
   colors here. Everything in the calendar follows these settings.
   ========================================================================= */

/** Group names shown in the calendar (edit freely). */
const LEVEL_LABEL: Record<SlotLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  open: "All levels",
};

/** Colors per group: beginner = yellow, intermediate = orange, advanced = pink. */
const LEVEL_STYLE: Record<SlotLevel, string> = {
  beginner: "bg-ball text-ink border-ball hover:brightness-105",
  intermediate: "bg-clay text-background border-clay hover:brightness-110",
  advanced: "bg-pink text-ink border-pink hover:brightness-105",
  open: "bg-background text-ink border-ink/15 hover:bg-ink/5",
};

/** Level rotation per weekday: 16:00 (60min) is always "open" (no level). */
const WEEKDAY_LEVELS: Record<number, Level[]> = {
  1: ["beginner", "intermediate", "advanced"],
  2: ["intermediate", "advanced", "beginner"],
  3: ["advanced", "beginner", "intermediate"],
  4: ["beginner", "advanced", "intermediate"],
  5: ["intermediate", "beginner", "advanced"],
};
const SAT_LEVELS: Level[] = ["beginner", "intermediate", "advanced", "beginner"];

/** Summer camp: 18:00–20:00 (2h), 2 coaches, 2 groups of max 6. */
const CAMP_DAYS = ["2026-08-12", "2026-08-14", "2026-08-17"];

/* ========================================================================= */

type PublicBooking = {
  starts_at: string;
  level: Level;
  first_name: string;
  last_initials: string;
};

type Slot = { start: Date; duration: number; level: SlotLevel; camp?: boolean };

function ymd(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function buildSlotsForDate(date: Date): Slot[] {
  const day = date.getDay();
  if (day === 0) return [];

  const slots: Slot[] = [];

  // Extra 1h slot at 16:00 on Mon / Tue / Wed — no level defined.
  if (day === 1 || day === 2 || day === 3) {
    const early = new Date(date);
    early.setHours(16, 0, 0, 0);
    slots.push({ start: early, duration: 60, level: "open" });
  }

  const defs: [number, number, number][] =
    day === 6
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
  const levels = day === 6 ? SAT_LEVELS : (WEEKDAY_LEVELS[day] ?? []);
  const isCampDay = CAMP_DAYS.includes(ymd(date));

  defs.forEach(([h, m, duration], i) => {
    // On camp days the court is used by the camp from 18:00 to 20:00.
    if (isCampDay && (h === 18 || h === 19)) return;
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    slots.push({ start: d, duration, level: levels[i] ?? "beginner" });
  });

  if (isCampDay) {
    const camp = new Date(date);
    camp.setHours(18, 0, 0, 0);
    slots.push({ start: camp, duration: 120, level: "open", camp: true });
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
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
    <main className="relative min-h-screen text-left">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2 font-display text-lg sm:text-2xl uppercase">
            <span
              className="inline-block w-7 h-7 shrink-0 rounded-full bg-ball ball-spin shadow-inner"
              style={{ boxShadow: "inset -4px -4px 0 oklch(0.78 0.18 115)" }}
            />
            <span className="truncate">Youpi Tennis Club</span>
          </Link>
          <Link
            to="/"
            className="shrink-0 px-4 py-2.5 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ball/40 transition"
          >
            ← Back
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <h1 className="text-[clamp(2.25rem,8vw,5rem)] font-display uppercase leading-none break-words">
          Book your <span className="text-clay">tennis session</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Pick a slot, tell me your level, and you're in. Mon–Wed:{" "}
          <b className="text-ink">16:00 (60 min)</b>. Mon–Fri:{" "}
          <b className="text-ink">17:00 (60 min)</b>, <b className="text-ink">18:00</b> &{" "}
          <b className="text-ink">19:30</b> (90 min). Saturday{" "}
          <b className="text-ink">10 AM–4 PM</b>.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
          {(["beginner", "intermediate", "advanced"] as Level[]).map((lv) => (
            <span key={lv} className={`px-3 py-1.5 rounded-full border-2 ${LEVEL_STYLE[lv]}`}>
              {LEVEL_LABEL[lv]}
            </span>
          ))}
          <span className="px-3 py-1.5 rounded-full border-2 bg-destructive text-destructive-foreground border-destructive">
            Summer camp
          </span>
        </div>
      </section>

      {/* GATE */}
      {!unlocked ? (
        <section className="max-w-xl mx-auto px-6 pb-24">
          <div className="rounded-3xl bg-card border-2 border-ink p-6 md:p-8 shadow-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ball text-ink text-xs font-semibold uppercase tracking-widest mb-4">
              🔒 Early access
            </div>
            <h2 className="font-display text-2xl sm:text-3xl uppercase mb-2 break-words">
              Unlock the calendar
            </h2>
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
                  className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                />
                <input
                  required
                  maxLength={60}
                  value={gateLast}
                  onChange={(e) => setGateLast(e.target.value)}
                  placeholder="Last name"
                  className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                />
              </div>
              <input
                required
                type="email"
                maxLength={120}
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                placeholder="Email address"
                className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
              />
              <input
                required
                type="tel"
                maxLength={30}
                value={gatePhone}
                onChange={(e) => setGatePhone(e.target.value)}
                placeholder="Phone number"
                className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
              />
              <button
                type="submit"
                className="mt-2 px-7 py-4 rounded-2xl bg-violet text-violet-foreground font-semibold text-lg hover:opacity-90 transition"
              >
                Unlock calendar 🔓
              </button>
              <p className="text-xs text-muted-foreground">
                Your info is used only to contact you about your booking.
              </p>
            </form>
          </div>
        </section>
      ) : (
        <>
          {/* CALENDAR */}
          <section className="max-w-6xl mx-auto px-6 pb-10">
            <div className="grid gap-4 mb-4 md:flex md:items-end md:justify-between">
              <div className="min-w-0">
                <h2 className="font-display text-xl sm:text-2xl uppercase break-words">
                  Available slots{" "}
                  <span className="text-muted-foreground text-base normal-case">(Summer season)</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Each slot shows its group. In{" "}
                  <span className="font-semibold text-destructive">red</span>: Summer camp (12.08,
                  14.08 &amp; 17.08 · 18:00–20:00).
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
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
              <div className="py-16 text-muted-foreground">Loading schedule…</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
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
                        className={`px-3 py-2 text-xs font-bold uppercase tracking-wider truncate ${
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
                            const inverted = selected || slot.camp;
                            return (
                              <button
                                key={slot.start.toISOString()}
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  if (slot.level !== "open") setLevel(slot.level);
                                }}
                                disabled={full || past}
                                className={`w-full min-w-0 text-left rounded-xl px-3 py-2 text-sm font-semibold transition border-2 ${
                                  past
                                    ? "opacity-40 line-through cursor-not-allowed border-transparent"
                                    : full
                                      ? "bg-ink/5 text-muted-foreground line-through cursor-not-allowed border-transparent"
                                      : selected
                                        ? "bg-court text-primary-foreground border-court"
                                        : slot.camp
                                          ? "bg-destructive text-destructive-foreground border-destructive hover:opacity-90"
                                          : LEVEL_STYLE[slot.level]
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="min-w-0 truncate">
                                    {fmtTime(slot.start)}
                                    <span className="ml-1 text-[10px] font-normal opacity-70">
                                      · {slot.duration}m
                                    </span>
                                  </span>
                                  <span
                                    className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${
                                      inverted ? "bg-background/25" : "bg-ink/10"
                                    }`}
                                  >
                                    {parts.length}/{MAX_PER_SLOT}
                                  </span>
                                </div>
                                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide truncate opacity-90">
                                  {slot.camp ? "🔥 Summer camp" : LEVEL_LABEL[slot.level]}
                                </div>
                                {parts.length > 0 && !past && (
                                  <div className="mt-1 text-[10px] font-normal truncate opacity-80">
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
                    ({selectedSlot.duration} min ·{" "}
                    {selectedSlot.camp ? "Summer camp" : LEVEL_LABEL[selectedSlot.level]})
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
                    className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                  />
                  <input
                    required
                    maxLength={60}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                  />
                </div>
                <input
                  required
                  type="email"
                  maxLength={120}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                />
                <input
                  required
                  type="tel"
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
                />

                <fieldset className="mt-2">
                  <legend className="text-sm font-semibold mb-2">Your tennis level</legend>
                  <div className="grid gap-2">
                    {([
                      { key: "beginner", label: "Total beginner", hint: "less than 10 hours of training" },
                      { key: "intermediate", label: "Intermediate", hint: "more than 6 months of tennis with training" },
                      { key: "advanced", label: "Advanced", hint: "years of experience, match play" },
                    ] as { key: Level; label: string; hint: string }[]).map((lv) => (
                      <button
                        type="button"
                        key={lv.key}
                        onClick={() => setLevel(lv.key)}
                        className={`w-full px-4 py-3 rounded-2xl border-2 text-left transition ${
                          level === lv.key
                            ? "bg-court text-primary-foreground border-court"
                            : "bg-background border-ink/10 hover:bg-ball/40"
                        }`}
                      >
                        <div className="font-semibold break-words">{lv.label}</div>
                        <div className={`text-xs ${level === lv.key ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {lv.hint}
                        </div>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={!selectedSlot || submitting}
                  className="mt-4 px-7 py-5 rounded-2xl bg-violet text-violet-foreground font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Booking…" : "Book your lesson 🎾"}
                </button>
                <p className="text-xs text-muted-foreground">
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
