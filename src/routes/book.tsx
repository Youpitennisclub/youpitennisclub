import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PhotoPicker } from "@/components/PhotoPicker";
import { createBooking, requestCancellation } from "@/lib/bookings.functions";


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

/** Group names shown in the calendar (edit freely). "open" shows no label. */
const LEVEL_LABEL: Record<SlotLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  open: "",
};

/** Colors per group: beginner = yellow, intermediate = orange, advanced = pink. */
const LEVEL_STYLE: Record<SlotLevel, string> = {
  beginner: "bg-ball text-ink border-ball hover:brightness-105",
  intermediate: "bg-clay text-background border-clay hover:brightness-110",
  advanced: "bg-pink text-ink border-pink hover:brightness-105",
  open: "bg-background text-ink border-ink/15 hover:bg-ink/5",
};

/** Level rotation per weekday (Mon–Fri) for the evening slots. */
const WEEKDAY_LEVELS: Record<number, Level[]> = {
  1: ["beginner", "intermediate", "advanced"],
  2: ["intermediate", "advanced", "beginner"],
  3: ["advanced", "beginner", "intermediate"],
  4: ["beginner", "advanced", "intermediate"],
};
const SAT_LEVELS: Level[] = ["beginner", "intermediate", "advanced", "beginner"];

/** Friday has its own fixed schedule. */
const FRIDAY: { h: number; m: number; duration: number; level: Level }[] = [
  { h: 16, m: 0, duration: 90, level: "advanced" },
  { h: 17, m: 30, duration: 60, level: "beginner" },
  { h: 18, m: 30, duration: 90, level: "intermediate" },
];

/** Summer camp: 18:30–20:30 (2h), 2 coaches, groups of 4–6. */
const CAMP_DAYS = ["2026-08-17", "2026-08-18", "2026-08-20"];

/** Price grid shown in the booking modal. */
const RATES: Record<number, { n: string; p: string }[]> = {
  60: [
    { n: "2 players", p: "€25" },
    { n: "3 players", p: "€19" },
    { n: "4 players", p: "€17" },
    { n: "5 players", p: "€15" },
    { n: "6 players", p: "€13" },
  ],
  90: [
    { n: "2 players", p: "€37" },
    { n: "3 players", p: "€28" },
    { n: "4 players", p: "€25" },
    { n: "5 players", p: "€22" },
    { n: "6 players", p: "€19" },
  ],
};

/* ========================================================================= */

type PublicBooking = {
  starts_at: string;
  level: Level;
  first_name: string;
  last_initials: string;
  photo_url: string | null;
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
  const isCampDay = CAMP_DAYS.includes(ymd(date));

  if (day === 5) {
    FRIDAY.forEach((f) => {
      const d = new Date(date);
      d.setHours(f.h, f.m, 0, 0);
      slots.push({ start: d, duration: f.duration, level: f.level });
    });
  } else {
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
            [19, 30, 60],
          ];

    const levels = day === 6 ? SAT_LEVELS : (WEEKDAY_LEVELS[day] ?? []);

    defs.forEach(([h, m, duration], i) => {
      // On camp days the court is used by the camp from 18:30 to 20:30.
      if (isCampDay && h >= 18) return;
      const d = new Date(date);
      d.setHours(h, m, 0, 0);
      slots.push({ start: d, duration, level: levels[i] ?? "beginner" });
    });
  }

  if (isCampDay) {
    const camp = new Date(date);
    camp.setHours(18, 30, 0, 0);
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

function fmtLongDay(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long" });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function endTime(slot: Slot) {
  return fmtTime(new Date(slot.start.getTime() + slot.duration * 60000));
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
      />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-card border-2 border-ink/10 shadow-2xl p-5 sm:p-7">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-9 w-9 rounded-full bg-ink/5 grid place-items-center text-lg font-bold"
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function BookPage() {
  const today = startOfDay(new Date());
  const [weekStart, setWeekStart] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [campInfo, setCampInfo] = useState<Slot | null>(null);
  const [winterOpen, setWinterOpen] = useState(false);
  const [bookings, setBookings] = useState<PublicBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelSending, setCancelSending] = useState(false);
  const [cancelSent, setCancelSent] = useState(false);



  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [photo, setPhoto] = useState<string | null>(null);

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

  const openSlot = (slot: Slot) => {
    if (slot.camp) {
      setCampInfo(slot);
      return;
    }
    if (slot.level !== "open") setLevel(slot.level);
    setSelectedSlot(slot);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      await createBooking({
        data: {
          starts_at: selectedSlot.start.toISOString(),
          level,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          photo_url: photo,
          duration: selectedSlot.duration,
          camp: Boolean(selectedSlot.camp),
        },
      });
      toast.success("🎾 Booked! A confirmation email is on its way.");
      setSelectedSlot(null);
      await loadBookings();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(
        msg.includes("fully booked")
          ? "Sorry, this slot just got fully booked."
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const askCancel = async () => {
    const mail = email.trim();
    if (!mail) {
      toast.error("Please fill in the email address you used for the booking.");
      return;
    }
    setCancelSending(true);
    try {
      await requestCancellation({ data: { email: mail } });
      setCancelSent(true);
      toast.success("Cancellation request sent — check your inbox for the confirmation link.");
    } catch {
      toast.error("Couldn't send the cancellation email. Please try again.");
    } finally {
      setCancelSending(false);
    }
  };



  const inputCls =
    "w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition";

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

      <section className="max-w-6xl mx-auto px-5 sm:px-6 pt-8 pb-6">
        <h1 className="text-[clamp(2rem,8vw,4.5rem)] font-display uppercase leading-none break-words">
          Book your <span className="text-clay">tennis session</span>
        </h1>
        <p className="mt-4 max-w-xl text-base sm:text-lg text-muted-foreground">
          Pick a slot, tell me your level, and you're in. Mon–Thu:{" "}
          <b className="text-ink">16:00</b>, <b className="text-ink">17:00</b>,{" "}
          <b className="text-ink">18:00</b> &amp; <b className="text-ink">19:30</b>. Friday:{" "}
          <b className="text-ink">16:00</b>, <b className="text-ink">17:30</b> &amp;{" "}
          <b className="text-ink">18:30</b>. Saturday <b className="text-ink">10 AM–4 PM</b>.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
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
        <section className="max-w-xl mx-auto px-5 sm:px-6 pb-24">
          <div className="rounded-3xl bg-card border-2 border-ink p-5 sm:p-8 shadow-lg">
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
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  required
                  maxLength={60}
                  value={gateFirst}
                  onChange={(e) => setGateFirst(e.target.value)}
                  placeholder="First name"
                  className={inputCls}
                />
                <input
                  required
                  maxLength={60}
                  value={gateLast}
                  onChange={(e) => setGateLast(e.target.value)}
                  placeholder="Last name"
                  className={inputCls}
                />
              </div>
              <input
                required
                type="email"
                maxLength={120}
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                placeholder="Email address"
                className={inputCls}
              />
              <input
                required
                type="tel"
                maxLength={30}
                value={gatePhone}
                onChange={(e) => setGatePhone(e.target.value)}
                placeholder="Phone number"
                className={inputCls}
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
          <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-16">
            <div className="grid gap-3 mb-4 md:flex md:items-end md:justify-between">
              <div className="min-w-0">
                <h2 className="font-display text-xl sm:text-2xl uppercase break-words">
                  Available slots{" "}
                  <span className="text-muted-foreground text-base normal-case">(Summer season)</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Each slot shows its group. In{" "}
                  <span className="font-semibold text-destructive">red</span>: Summer camp (17.08,
                  18.08 &amp; 20.08 · 18:30–20:30).
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
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-full border-2 border-ink/15 text-sm font-semibold disabled:opacity-40 hover:bg-ball/40 transition"
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
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ball/40 transition"
                >
                  Next →
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-muted-foreground">Loading schedule…</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {days.map((day) => {
                  const slots = buildSlotsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={day.toISOString()}
                      className="rounded-2xl border-2 border-ink/10 bg-card overflow-hidden"
                    >
                      <div
                        className={`px-4 py-3 text-sm sm:text-base font-bold uppercase tracking-wide truncate ${
                          isToday ? "bg-ball text-ink" : "bg-ink/5 text-ink"
                        }`}
                      >
                        {fmtDay(day)}
                      </div>
                      <div className="p-2.5 flex flex-col gap-2">
                        {slots.length === 0 ? (
                          <div className="text-sm text-muted-foreground px-2 py-3">Rest day</div>
                        ) : (
                          slots.map((slot) => {
                            const parts = participantsFor(slot);
                            const full = isFull(slot);
                            const past = isPast(slot);
                            return (
                              <button
                                key={slot.start.toISOString()}
                                type="button"
                                onClick={() => openSlot(slot)}
                                disabled={full || past}
                                className={`w-full min-w-0 text-left rounded-xl px-3.5 py-3 font-semibold transition border-2 ${
                                  past
                                    ? "opacity-40 line-through cursor-not-allowed border-transparent"
                                    : full
                                      ? "bg-ink/5 text-muted-foreground line-through cursor-not-allowed border-transparent"
                                      : slot.camp
                                        ? "bg-destructive text-destructive-foreground border-destructive hover:opacity-90"
                                        : LEVEL_STYLE[slot.level]
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="min-w-0 truncate text-base sm:text-lg">
                                    {fmtTime(slot.start)}–{endTime(slot)}
                                  </span>
                                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-ink/10">
                                    {parts.length}/{MAX_PER_SLOT}
                                  </span>
                                </div>
                                {(slot.camp || slot.level !== "open") && (
                                  <div className="mt-1 text-xs font-bold uppercase tracking-wide truncate opacity-90">
                                    {slot.camp ? "🔥 Summer camp" : LEVEL_LABEL[slot.level]}
                                  </div>
                                )}
                                {parts.length > 0 && !past && (
                                  <div className="mt-2 flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                      {parts.slice(0, 6).map((p, i) =>
                                        p.photo_url ? (
                                          <img
                                            key={i}
                                            src={p.photo_url}
                                            alt={p.first_name}
                                            className="h-7 w-7 shrink-0 rounded-full object-cover border border-ink/10"
                                          />
                                        ) : (
                                          <span
                                            key={i}
                                            className="h-7 w-7 shrink-0 rounded-full bg-ink/10 grid place-items-center text-[11px] font-bold"
                                          >
                                            {p.first_name.slice(0, 1)}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                    <div className="text-sm font-semibold leading-snug break-words">
                                      {parts
                                        .map((p) => `${p.first_name} ${p.last_initials}.`)
                                        .join(" · ")}
                                    </div>
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




            <div className="mt-8 rounded-3xl bg-navy text-background p-5 sm:p-7">

              <h3 className="font-display text-xl sm:text-2xl uppercase">Winter season 🥶</h3>
              <p className="mt-2 text-background/75 text-sm sm:text-base max-w-xl">
                Indoor season from October to end of March — 1h30 every Saturday. Prices and
                Saturday slots are published in September; you can already tell me you're
                interested.
              </p>
              <button
                type="button"
                onClick={() => setWinterOpen(true)}
                className="mt-4 inline-block px-6 py-3.5 rounded-full bg-violet text-violet-foreground font-semibold hover:opacity-90 transition"
              >
                Pre-Book Your Winter Season
              </button>
            </div>
          </section>
        </>
      )}

      {/* WINTER MODAL */}
      {winterOpen && (
        <Modal onClose={() => setWinterOpen(false)}>
          <h3 className="font-display text-2xl uppercase mb-3 pr-10">
            Winter season pre-booking
          </h3>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
            <p>
              <b className="text-ink">Subscription from beginning of October to end of March</b> —
              one <b className="text-ink">1h30 session every Saturday</b>, indoor.
            </p>
            <p>
              Prices and the exact Saturday slots will be published in{" "}
              <b className="text-ink">September</b>. This is a non-binding notice of interest: get
              in touch and I'll keep a spot for you and send you all the details first.
            </p>
          </div>
          <div className="mt-5 grid gap-2">
            <a
              href="https://wa.me/4917645689622"
              target="_blank"
              rel="noopener"
              className="px-6 py-4 text-center rounded-2xl bg-violet text-violet-foreground font-semibold hover:opacity-90 transition"
            >
              I'm interested — WhatsApp
            </a>
            <a
              href="mailto:chaouchyoucef@yahoo.com?subject=Winter%20season%20pre-booking"
              className="px-6 py-4 text-center rounded-2xl border-2 border-ink/15 font-semibold hover:bg-ball/40 transition"
            >
              Send an email
            </a>
          </div>
        </Modal>
      )}

      {/* SUMMER CAMP MODAL */}
      {campInfo && (
        <Modal onClose={() => setCampInfo(null)}>
          <div className="text-xs font-bold uppercase tracking-widest text-destructive mb-2">
            Summer camp
          </div>
          <h3 className="font-display text-2xl sm:text-3xl uppercase mb-1 pr-10">
            Aug 17 + 18 + 20
          </h3>
          <div className="font-display text-xl mb-4">6:30–8:30 PM</div>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
            <p>
              I'm organising a <b className="text-ink">tennis camp with my best friend from
              France</b> 🇫🇷! He's been a <b className="text-ink">tennis coach for more than 10
              years</b> and is definitely more relaxed than me… 😅
            </p>
            <p>
              📅 <b className="text-ink">3 days between August 17 and 20</b>. Each session lasts 2
              hours, from 6:30 to 8:30 PM. We'll have groups of{" "}
              <b className="text-ink">4 to 6 students</b> with a similar level — beginner,
              intermediate or advanced, depending on the participants. Capacity is limited, so
              it's first come, first served!
            </p>
            <div className="rounded-2xl bg-ink/5 p-4 text-ink">
              <div className="font-display uppercase mb-2">How it works</div>
              <ul className="space-y-1.5 text-sm">
                <li>🎾 2 hours per day, over 3 days</li>
                <li>🔄 Rotation between the 2 coaches — two coaching perspectives</li>
                <li>🎯 3 days, 3 topics: footwork, tactics &amp; technique every day</li>
                <li>🗣️ Coaching language: English (or French 😅)</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-ball/40 p-4 text-ink">
              <div className="font-display uppercase mb-2">Prices 💸</div>
              <ul className="space-y-1.5 text-sm">
                <li>👥 Group of 4: BFC Alemannia members €130 / non-members €150</li>
                <li>👥 Group of 6: BFC Alemannia members €100 / non-members €120</li>
                <li>💳 Payment in advance via PayPal: chaouchyoucef@yahoo.com</li>
              </ul>
            </div>
            <p>
              If you can't make all 3 days and I find a <b className="text-ink">substitute</b> of a
              similar level, you can give your spot to a friend or family member.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const slot = campInfo;
              setCampInfo(null);
              setSelectedSlot(slot);
            }}
            className="mt-5 w-full px-7 py-4 rounded-2xl bg-violet text-violet-foreground font-semibold text-lg hover:opacity-90 transition"
          >
            Book my camp spot 🎾
          </button>
        </Modal>
      )}

      {/* BOOKING MODAL */}
      {selectedSlot && (
        <Modal onClose={() => setSelectedSlot(null)}>
          <div className="text-xs font-bold uppercase tracking-widest text-clay mb-2">
            {selectedSlot.camp
              ? "Summer camp"
              : selectedSlot.level === "open"
                ? "Open session"
                : `${LEVEL_LABEL[selectedSlot.level]} group`}
          </div>
          <div className="font-display text-2xl sm:text-3xl uppercase leading-tight pr-10 break-words">
            {fmtLongDay(selectedSlot.start)}
          </div>
          <div className="font-display text-3xl sm:text-4xl mt-1">
            {fmtTime(selectedSlot.start)}–{endTime(selectedSlot)}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {selectedSlot.duration} minutes ·{" "}
            {participantsFor(selectedSlot).length}/{MAX_PER_SLOT} players
          </div>

          <div className="mt-4 rounded-2xl bg-ball/30 border-2 border-ink/10 p-4">
            <div className="font-display text-sm uppercase mb-2">
              Price · {selectedSlot.camp ? "3 days camp" : `${selectedSlot.duration} min`}
            </div>
            {selectedSlot.camp ? (
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between gap-3">
                  <span>Group of 4</span>
                  <span className="font-display shrink-0">€130 members / €150</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span>Group of 6</span>
                  <span className="font-display shrink-0">€100 members / €120</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-1 text-sm">
                {(RATES[selectedSlot.duration] ?? RATES[90]).map((r) => (
                  <li key={r.n} className="flex justify-between gap-3">
                    <span className="text-ink/70">{r.n}</span>
                    <span className="font-display shrink-0">{r.p} / pers</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h3 className="font-display text-xl uppercase mt-6 mb-3">Your details</h3>
          <form onSubmit={submit} className="grid gap-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                required
                maxLength={60}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className={inputCls}
              />
              <input
                required
                maxLength={60}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className={inputCls}
              />
            </div>
            <input
              required
              type="email"
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className={inputCls}
            />
            <input
              required
              type="tel"
              maxLength={30}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className={inputCls}
            />

            <PhotoPicker value={photo} onChange={setPhoto} />

            <fieldset className="mt-1">
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
              disabled={submitting}
              className="mt-3 px-7 py-5 rounded-2xl bg-violet text-violet-foreground font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? "Booking…" : "Confirmation 🎾"}
            </button>
            <div className="mt-3 rounded-2xl bg-destructive/10 border-2 border-destructive p-4">
              <div className="font-display text-lg sm:text-xl uppercase text-destructive leading-tight">
                Cancellation only up to 24h before the session
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">
                One click on the button below and I receive your cancellation request with all
                your booking details. You'll then get a confirmation link by email — the
                cancellation is final once you click it. Later than 24h before the start,
                cancellation is not possible.
              </p>
              <button
                type="button"
                disabled={cancelSending || cancelSent}
                onClick={askCancel}
                className="mt-3 w-full px-6 py-3.5 rounded-2xl bg-destructive text-destructive-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {cancelSent
                  ? "Cancellation request sent ✅"
                  : cancelSending
                    ? "Sending…"
                    : "Cancel a booking"}
              </button>
            </div>


            <p className="text-xs text-muted-foreground">
              Rain policy: 50% refund or reschedule.
            </p>

          </form>
        </Modal>
      )}
    </main>
  );
}
