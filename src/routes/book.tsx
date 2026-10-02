import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PhotoPicker } from "@/components/PhotoPicker";
import { CopyNumberButton } from "@/components/CopyNumberButton";
import { getWhatsAppLink, WhatsAppIcon } from "@/components/WhatsAppIcon";
import { createBooking, listMyBookings, cancelMyBooking } from "@/lib/bookings.functions";
import { isAdmin } from "@/lib/admin.functions";
import { ratesFor } from "@/lib/prices";


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
      { property: "og:url", content: "https://youpitennisclub.com/book" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://youpitennisclub.com/book" }],
  }),
  component: BookPage,
});

type Level = "total_beginner" | "beginner" | "intermediate" | "advanced";
/** "open" = mixed slot, no level defined */
type SlotLevel = Level | "open";
/** Clubs the sessions take place at. */
type Venue = "alemannia" | "longline";

const MAX_PER_SLOT = 6;

/* =========================================================================
   ADMIN CONFIG — edit the group names, the daily level rotation and the
   colors here. Everything in the calendar follows these settings.
   ========================================================================= */

/** Group names shown in the calendar (edit freely). "open" shows no label. */
const LEVEL_LABEL: Record<SlotLevel, string> = {
  total_beginner: "Total beginner",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  open: "",
};

/** Colors per group: total beginner = sky, beginner = yellow, intermediate = orange, advanced = pink. */
const LEVEL_STYLE: Record<SlotLevel, string> = {
  total_beginner: "bg-sky text-ink border-sky hover:brightness-105",
  beginner: "bg-ball text-ink border-ball hover:brightness-105",
  intermediate: "bg-clay text-background border-clay hover:brightness-110",
  advanced: "bg-pink text-ink border-pink hover:brightness-105",
  open: "bg-background text-ink border-ink/15 hover:bg-ink/5",
};

/** Club names — shown in the legend, on every slot, in the modals and in the emails. */
const VENUE_LABEL: Record<Venue, string> = {
  alemannia: "BFC Alemannia",
  longline: "TC Longline",
};

/** Club color codes: BFC Alemannia = navy blue, TC Longline = clay orange. */
const VENUE_STYLE: Record<Venue, string> = {
  alemannia: "bg-navy text-background border-navy",
  longline: "bg-clay text-background border-clay",
};

/** Available court hours (1h slots), per weekday and per club. */
const CLUB_HOURS: Record<number, { club: Venue; hours: number[] }[]> = {
  1: [{ club: "alemannia", hours: [13, 14, 15] }], // Mon — BFC Alemannia 13–16h
  2: [{ club: "alemannia", hours: [12, 13, 14] }], // Tue — BFC Alemannia 12–15h
  3: [{ club: "alemannia", hours: [14, 15, 16] }], // Wed — BFC Alemannia 14–17h
  4: [{ club: "alemannia", hours: [12, 13, 14] }], // Thu — BFC Alemannia 12–15h
  5: [{ club: "longline", hours: [11, 12, 13, 14, 15, 16] }], // Fri — TC Longline 11–17h
  6: [{ club: "alemannia", hours: [9, 10, 13, 14] }], // Sat — BFC Alemannia 09–11h & 13–15h
};

/** Summer camp: 18:30–20:30 (2h), 2 coaches, groups of 4–6. */
const CAMP_DAYS = ["2026-08-17", "2026-08-18", "2026-08-20"];

/** One-off 90-min slots (17:00–18:30) at BFC Alemannia for the first winter week. */
const SPECIAL_90MIN_DAYS: Record<string, number> = {
  "2026-10-07": 17, // Wed 07.10
  "2026-10-09": 17, // Fri 09.10
  "2026-10-12": 17, // Mon 12.10
};
/** Extra one-off 1-hour slots at BFC Alemannia on the outdoor days. */
const EXTRA_60MIN_DAYS: Record<string, number[]> = {
  "2026-10-09": [16], // Fri 09.10 — 16:00–17:00 outdoor
};
/** Indoor 1-hour slots at BFC Alemannia — labelled INDOOR in the calendar. */
const INDOOR_60MIN_DAYS: Record<string, number[]> = {
  "2026-10-07": [21], // Wed 07.10 — 21:00–22:00 indoor
};
/** Days where regular hours are replaced by special evening slots (BFC Alemannia). */
const EVENING_ONLY_DAYS: Record<string, number[]> = {
  "2026-10-08": [20, 21], // Thu 08.10 — 20:00–21:00 & 21:00–22:00 only
};
/** Days played outdoor — highlighted in the calendar. */
const OUTDOOR_DAYS = new Set(["2026-10-07", "2026-10-09"]);
/** TC Longline winter season starts on this date — no Longline slots before. */
const LONGLINE_FROM = "2026-10-12";

/** Price grid shown in the booking modal: see ratesFor (club + hour). */

/* ========================================================================= */

type PublicBooking = {
  starts_at: string;
  level: Level;
  venue: Venue;
  first_name: string;
  last_initials: string;
  photo_url: string | null;
  confirmed?: boolean;
};

type Slot = {
  start: Date;
  duration: number;
  level: SlotLevel;
  venue: Venue;
  camp?: boolean;
  indoor?: boolean;
};

type MyBooking = {
  id: string;
  starts_at: string;
  level: Level;
  venue?: Venue;
  cancellable: boolean;
};

function ymd(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** No slots up to and including this date. */
const FIRST_OPEN_DAY = "2026-10-07";
/** Last day of the winter season — slots are listed up to and including this date. */
const SEASON_END = new Date("2027-04-04T23:59:59");

/** Minimum students of the same level to confirm a slot. */
function groupMin(start: Date) {
  const day = start.getDay();
  const weekend = day === 0 || day === 6;
  if (weekend) return 4;
  const h = start.getHours();
  // From 16:00 on weekdays a full group of 4 is needed.
  return h >= 16 ? 4 : 2;
}

function buildSlotsForDate(date: Date): Slot[] {
  const day = date.getDay();
  if (ymd(date) < FIRST_OPEN_DAY) return [];

  const slots: Slot[] = [];
  const isCampDay = CAMP_DAYS.includes(ymd(date));

  // Special days: evening slots only, regular hours are not offered.
  const eveningOnly = EVENING_ONLY_DAYS[ymd(date)];
  if (eveningOnly) {
    for (const h of eveningOnly) {
      const d = new Date(date);
      d.setHours(h, 0, 0, 0);
      slots.push({ start: d, duration: 60, level: "open", venue: "alemannia" });
    }
    return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  // 1-hour slots, only at the hours each club actually has free.
  for (const { club, hours } of CLUB_HOURS[day] ?? []) {
    // TC Longline: winter season starts 12 Oct — no Longline slots before that.
    if (club === "longline" && ymd(date) < LONGLINE_FROM) continue;
    for (const h of hours) {
      // Mon 12.10: slots only from 15:00.
      if (ymd(date) === "2026-10-12" && h < 15) continue;
      if (isCampDay && h >= 18) continue;
      const d = new Date(date);
      d.setHours(h, 0, 0, 0);
      slots.push({ start: d, duration: 60, level: "open", venue: club });
    }
  }
  // Extra one-off 1-hour slots on the outdoor days (BFC Alemannia).
  for (const h of EXTRA_60MIN_DAYS[ymd(date)] ?? []) {
    const d = new Date(date);
    d.setHours(h, 0, 0, 0);
    slots.push({ start: d, duration: 60, level: "open", venue: "alemannia" });
  }
  // Indoor 1-hour evening slots — highlighted as INDOOR.
  for (const h of INDOOR_60MIN_DAYS[ymd(date)] ?? []) {
    const d = new Date(date);
    d.setHours(h, 0, 0, 0);
    slots.push({ start: d, duration: 60, level: "open", venue: "alemannia", indoor: true });
  }
  // One-off 90-min slot 17:00–18:30 at BFC Alemannia.
  const specialHour = SPECIAL_90MIN_DAYS[ymd(date)];
  if (specialHour !== undefined) {
    const d = new Date(date);
    d.setHours(specialHour, 0, 0, 0);
    slots.push({ start: d, duration: 90, level: "open", venue: "alemannia" });
  }
  if (isCampDay) {
    const camp = new Date(date);
    camp.setHours(18, 30, 0, 0);
    slots.push({ start: camp, duration: 120, level: "open", venue: "alemannia", camp: true });
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
  const navigate = useNavigate();
  const today = startOfDay(new Date());
  const [weekStart, setWeekStart] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [campInfo, setCampInfo] = useState<Slot | null>(null);
  const [winterOpen, setWinterOpen] = useState(false);
  const [bookings, setBookings] = useState<PublicBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelPassword, setCancelPassword] = useState("");
  const [cancelShowPassword, setCancelShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [photo, setPhoto] = useState<string | null>(null);

  // The calendar is reserved for students with an account.
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [myBookings, setMyBookings] = useState<MyBooking[]>([]);

  const applyUser = (user: {
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  } | null) => {
    if (!user) {
      setUnlocked(false);
      setMyBookings([]);
      return;
    }
    const meta = user.user_metadata ?? {};
    setFirstName((prev) => prev || String(meta['first_name'] ?? ""));
    setLastName((prev) => prev || String(meta['last_name'] ?? ""));
    setPhone((prev) => prev || String(meta['phone'] ?? ""));
    setEmail(user.email ?? "");
    setUnlocked(true);
  };

  // Admin: auto-access in the Lovable editor preview, or via the secret admin link cookie.
  const [adminView, setAdminView] = useState(false);
  useEffect(() => {
    const h = window.location.hostname;
    if (h.startsWith("id-preview--") || h === "localhost") setAdminView(true);
    isAdmin().then((r) => r.admin && setAdminView(true)).catch(() => {});
  }, []);
  useEffect(() => {
    if (adminView && !checkingAuth) setUnlocked(true);
  }, [adminView, checkingAuth]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      applyUser(data.session?.user ?? null);
      setCheckingAuth(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      applyUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyBookings = async () => {
    try {
      const rows = await listMyBookings({});
      setMyBookings(rows as MyBooking[]);
    } catch {
      /* not signed in */
    }
  };

  /** Step 1: ask for the account password. */
  const cancelOne = (id: string) => {
    setCancelId(id);
    setCancelPassword("");
    setCancelShowPassword(false);
  };

  /** Step 2: cancel, password checked on the server. */
  const confirmCancel = async () => {
    if (!cancelId) return;
    if (!cancelPassword.trim()) {
      toast.error("Please enter your account password.");
      return;
    }
    const id = cancelId;
    setCancellingId(id);
    try {
      const res = (await cancelMyBooking({
        data: { id, password: cancelPassword },
      })) as { status: string };
      if (res.status === "cancelled") {
        toast.success("Booking cancelled — a confirmation email is on its way.");
        setCancelId(null);
        setCancelPassword("");
      } else if (res.status === "bad_password") {
        toast.error("Wrong password. Only the account owner can cancel this booking.");
      } else if (res.status === "too_late") {
        toast.error("Too late: cancellation is only possible up to 24h before the session.");
        setCancelId(null);
      } else if (res.status === "already") {
        toast.info("This booking was already cancelled.");
        setCancelId(null);
      } else {
        toast.error("This booking doesn't belong to your account.");
        setCancelId(null);
      }
      await loadMyBookings();
      await loadBookings();
    } catch {
      toast.error("Couldn't cancel. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUnlocked(false);
    setMyBookings([]);
    toast.success("Signed out.");
    navigate({ to: "/" });
  };


  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      if (d.getTime() > SEASON_END.getTime()) break;
      arr.push(d);
    }
    return arr;
  }, [weekStart]);

  const nextWeekStart = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d;
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
    loadBookings();
    if (unlocked) loadMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  const participantsFor = (slot: Slot) =>
    bookings.filter(
      (b) =>
        new Date(b.starts_at).getTime() === slot.start.getTime() &&
        (b.venue ?? "alemannia") === slot.venue,
    );

  const isFull = (slot: Slot) => participantsFor(slot).length >= MAX_PER_SLOT;
  const isPast = (slot: Slot) => slot.start.getTime() <= Date.now();

  const openSlot = (slot: Slot) => {
    if (slot.camp) {
      setCampInfo(slot);
      return;
    }
    if (!unlocked) {
      toast.error("Sign in to book this slot — use the sign-in button above the calendar.");
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
      const res = (await createBooking({
        data: {
          starts_at: selectedSlot.start.toISOString(),
          level,
          venue: selectedSlot.venue,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          photo_url: photo,
          duration: selectedSlot.duration,
          camp: Boolean(selectedSlot.camp),
        },
      })) as { confirmed?: boolean; count?: number };
      toast.success(
        res.confirmed
          ? "🎾 Group confirmed! A confirmation email is on its way."
          : `⏳ Booked (${res.count ?? 1}/${groupMin(selectedSlot.start)}). The session is confirmed automatically once ${groupMin(selectedSlot.start)} students of your level join.`,
      );
      setSelectedSlot(null);
      await loadBookings();
      await loadMyBookings();
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






  const inputCls =
    "w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-clay outline-none transition";

  return (
    <main className="relative min-h-screen text-left">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2 font-display text-base sm:text-2xl uppercase leading-tight">
            <span
              className="inline-block w-7 h-7 shrink-0 rounded-full bg-ball ball-spin shadow-inner"
              style={{ boxShadow: "inset -4px -4px 0 oklch(0.77 0.17 100)" }}
            />
            <span className="min-w-0 break-words">Youpi Tennis Club</span>
          </Link>
          <div className="col-span-2 flex min-w-0 flex-wrap items-center justify-end gap-2 sm:col-span-1 sm:shrink-0 sm:flex-nowrap">
            {unlocked && (
              <span
                title={email}
                className="inline-flex min-w-0 max-w-full items-center gap-2 px-3 py-2 rounded-full border-2 border-clay/40 bg-clay/10 text-xs sm:max-w-[14rem] sm:text-sm font-semibold"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-clay opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-clay" />
                </span>
                <span className="min-w-0 break-all">
                  {firstName?.trim() || email.split("@")[0] || "Connected"}
                </span>
              </span>
            )}
            {unlocked && (
              <button
                onClick={signOut}
                className="shrink-0 px-3 py-2.5 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ink/5 transition"
              >
                Sign out
              </button>
            )}
            <Link
              to="/"
              className="shrink-0 px-4 py-2.5 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ball/40 transition"
            >
              ← Back
            </Link>
          </div>

        </div>
      </header>

      <section className="max-w-6xl mx-auto px-5 sm:px-6 pt-8 pb-6">
        <h1 className="text-[clamp(2rem,8vw,4.5rem)] font-display uppercase leading-none break-words">
          Book your <span className="text-clay">tennis session</span>
        </h1>
        <p className="mt-4 max-w-xl text-base sm:text-lg text-muted-foreground">
          <b className="text-ink">Winter season bookings are open!</b> 1-hour sessions at BFC Alemannia and TC Longline. Pick your level and book — the session is confirmed automatically when enough students of the same level join:{" "}
          <b className="text-ink">2 students</b> on weekdays before 16:00,{" "}
          <b className="text-ink">4 students</b> on weekdays from 16:00 and on weekends. Intermediate and Advanced can play together. I can also train you in a group of{" "}
          <b className="text-ink">3 students</b> — for a private lesson, contact me directly on{" "}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-clay font-semibold hover:underline"
          >
            <WhatsAppIcon className="text-[#25D366]" />
            WhatsApp
          </a>{" "}
          or by{" "}
          <a
            href="mailto:youpitennisclub@gmail.com"
            className="text-clay font-semibold hover:underline break-all"
          >
            email
          </a>
          .
        </p>
        <CopyNumberButton
          className="mt-4"
          label="Copy number"
          hint="WhatsApp doesn't open? Copy the number and save it."
        />
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
          {(["total_beginner", "beginner", "intermediate", "advanced"] as Level[]).map((lv) => (
            <span key={lv} className={`px-3 py-1.5 rounded-full border-2 ${LEVEL_STYLE[lv]}`}>
              {LEVEL_LABEL[lv]}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <span className="text-muted-foreground font-semibold normal-case">Where:</span>
          {(["alemannia", "longline"] as Venue[]).map((v) => (
            <span
              key={v}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 ${VENUE_STYLE[v]}`}
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-background" />
              {VENUE_LABEL[v]}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-sky bg-sky/30 px-3 py-1.5 text-ink">
            <span aria-hidden="true">☀️</span> Outdoor days
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-ink/10 px-3 py-1.5 text-ink">
            <span aria-hidden="true">🌙</span> Indoor sessions
          </span>
        </div>
      </section>

      {/* SIGN-IN GATE — students must sign in to see the calendar */}
      {!unlocked && !checkingAuth && (
        <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-16">
          <div className="rounded-3xl bg-card border-2 border-ink p-5 sm:p-6 shadow-lg grid gap-3 sm:flex sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl uppercase break-words">
                Sign in to see the calendar
              </h2>
              <p className="text-muted-foreground text-sm mt-1 break-words">
                The booking calendar is reserved for students with an account. You stay signed in on this device.
              </p>
            </div>
            <Link
              to="/auth"
              className="shrink-0 px-6 py-3.5 rounded-2xl bg-violet text-violet-foreground font-semibold text-center hover:opacity-90 transition"
            >
              Sign in / Create my account 🎾
            </Link>
          </div>
        </section>
      )}

      {unlocked && (
      <>
          {/* CALENDAR */}
          <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-16">
            <div className="grid gap-3 mb-4 md:flex md:items-end md:justify-between">
              <div className="min-w-0">
                <h2 className="font-display text-xl sm:text-2xl uppercase break-words">
                  Available slots{" "}
                  <span className="text-muted-foreground text-base normal-case">(Winter season)</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Every slot shows its club:{" "}
                  <span className="font-semibold text-navy">navy = BFC Alemannia</span>,{" "}
                  <span className="font-semibold text-clay">orange = TC Longline</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Winter season:{" "}
                  <span className="font-semibold text-ink">7 Oct 2026 → 4 Apr 2027</span>.
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
                    if (nextWeekStart.getTime() > SEASON_END.getTime()) return;
                    setWeekStart(nextWeekStart);
                  }}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ball/40 transition disabled:opacity-40"
                  disabled={nextWeekStart.getTime() > SEASON_END.getTime()}
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
                  const outdoor = OUTDOOR_DAYS.has(ymd(day));
                  return (
                    <div
                      key={day.toISOString()}
                      className={`rounded-2xl border-2 bg-card overflow-hidden ${
                        outdoor ? "border-sky" : "border-ink/10"
                      }`}
                    >
                      <div
                        className={`px-4 py-3 font-bold uppercase tracking-wide break-words ${
                          outdoor
                            ? "bg-sky text-ink"
                            : isToday
                              ? "bg-ball text-ink"
                              : "bg-ink/5 text-ink"
                        }`}
                      >
                        <div className="text-sm sm:text-base">{fmtDay(day)}</div>
                        {outdoor && (
                          <div className="mt-2 flex w-fit items-center gap-2 rounded-full bg-background px-3.5 py-1.5 font-display text-base tracking-[0.18em] text-ink shadow-sm">
                            <span aria-hidden="true">☀️</span>
                            OUTDOOR
                          </div>
                        )}
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
                                key={`${slot.start.toISOString()}-${slot.venue}-${slot.camp ? "camp" : "lesson"}`}
                                type="button"
                                onClick={() => openSlot(slot)}
                                disabled={full || past}
                                className={`w-full min-w-0 text-left rounded-xl px-3.5 py-3 font-semibold transition border-2 ${
                                  past
                                    ? "opacity-40 line-through cursor-not-allowed border-transparent"
                                    : full
                                      ? "bg-ink/5 text-muted-foreground line-through cursor-not-allowed border-transparent"
                                      : LEVEL_STYLE[slot.level]
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="min-w-0 break-words text-base sm:text-lg">
                                    {fmtTime(slot.start)}–{endTime(slot)}
                                  </span>
                                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-ink/10">
                                    {parts.length}/{groupMin(slot.start)}
                                  </span>
                                </div>
                                {slot.indoor && (
                                  <div className="mt-2 flex w-fit items-center gap-2 rounded-full border-2 border-ink bg-ink/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-ink">
                                    <span aria-hidden="true">🌙</span>
                                    INDOOR
                                  </div>
                                )}
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span
                                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-2.5 py-1 text-[10px] font-bold ${VENUE_STYLE[slot.venue]}`}
                                  >
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-background" />
                                    {VENUE_LABEL[slot.venue]}
                                  </span>
                                  {slot.level !== "open" && (
                                    <span className="min-w-0 break-words text-xs font-bold uppercase tracking-wide opacity-90">
                                      {LEVEL_LABEL[slot.level]}
                                    </span>
                                  )}
                                </div>
                                {parts.length > 0 && !past && (
                                  <div className="mt-1 text-xs font-bold break-words">
                                    {parts.some((p) => p.confirmed)
                                      ? "✅ Confirmed"
                                      : `⏳ Booked ${parts.length}/${groupMin(slot.start)}`}
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

            {/* MY BOOKINGS */}
            {unlocked && (
            <div className="mt-8 rounded-3xl bg-card border-2 border-ink p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl sm:text-2xl uppercase">My bookings</h3>
                <button
                  type="button"
                  onClick={signOut}
                  className="px-4 py-2.5 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ball/40 transition"
                >
                  Sign out
                </button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Only your own sessions appear here — cancellation is possible up to 24h before
                the start.
              </p>
              {myBookings.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No upcoming booking yet.</p>
              ) : (
                <ul className="mt-4 grid gap-2">
                  {myBookings.map((b) => (
                    <li
                      key={b.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink/10 px-4 py-3"
                    >
                      <span className="font-semibold">
                        {new Date(b.starts_at).toLocaleString("en-GB", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        <span className={`ml-2 inline-flex items-center gap-1.5 rounded-full border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${VENUE_STYLE[b.venue ?? "alemannia"]}`}>
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-background" />
                          {VENUE_LABEL[b.venue ?? "alemannia"]}
                        </span>
                        <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">
                          {LEVEL_LABEL[b.level]}
                        </span>
                      </span>
                      <button
                        type="button"
                        disabled={!b.cancellable || cancellingId === b.id}
                        onClick={() => cancelOne(b.id)}
                        className="px-4 py-2.5 rounded-full bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-40"
                      >
                        {cancellingId === b.id
                          ? "Cancelling…"
                          : b.cancellable
                            ? "Cancel"
                            : "Less than 24h"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            )}





            <div className="mt-8 rounded-3xl bg-navy text-background p-5 sm:p-7">

              <h3 className="font-display text-xl sm:text-2xl uppercase">Winter season bookings are open 🥶</h3>
              <p className="mt-2 text-background/75 text-sm sm:text-base max-w-xl">
                Indoor season from October to end of March — book your 1-hour sessions directly in the
                calendar above. Prices depend on the club, the time and the group size.
              </p>
              <button
                type="button"
                onClick={() => setWinterOpen(true)}
                className="mt-4 inline-block px-6 py-3.5 rounded-full bg-violet text-violet-foreground font-semibold hover:opacity-90 transition"
              >
                Questions? Contact me
              </button>
            </div>
          </section>
        </>
      )}

      {/* WINTER MODAL */}
      {winterOpen && (
        <Modal onClose={() => setWinterOpen(false)}>
          <h3 className="font-display text-2xl uppercase mb-3 pr-10">
            Winter season — bookings open
          </h3>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
            <p>
              <b className="text-ink">From October to end of March</b> — indoor 1-hour group
              sessions at <b className="text-ink">BFC Alemannia</b> and <b className="text-ink">TC Longline</b>.
            </p>
            <p>
              Book directly in the calendar. Any question? Get in touch.
            </p>
          </div>
          <div className="mt-5 grid gap-2">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener"
              className="px-6 py-4 text-center rounded-2xl bg-violet text-violet-foreground font-semibold hover:opacity-90 transition inline-flex items-center justify-center gap-2"
            >
              <WhatsAppIcon className="text-xl" />
              +49 176 45689622 · WhatsApp preferred
            </a>
            <CopyNumberButton
              className="justify-center"
              label="Copy number"
              hint="if WhatsApp doesn't open"
            />
            <a
              href="mailto:youpitennisclub@gmail.com?subject=Winter%20season"
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
              <b className="text-ink">4 to 6 students</b> with a similar level — total beginner,
              beginner, intermediate or advanced, depending on the participants. Capacity is limited, so
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
            {selectedSlot.level === "open"
              ? "Open session — choose your level"
              : `${LEVEL_LABEL[selectedSlot.level]} group`}
          </div>
          <div className="font-display text-2xl sm:text-3xl uppercase leading-tight pr-10 break-words">
            {fmtLongDay(selectedSlot.start)}
          </div>
          <div className="font-display text-3xl sm:text-4xl mt-1">
            {fmtTime(selectedSlot.start)}–{endTime(selectedSlot)}
          </div>
          <div
            className={`mt-3 inline-flex max-w-full items-center gap-2 rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-wide ${VENUE_STYLE[selectedSlot.venue]}`}
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-background" />
            {VENUE_LABEL[selectedSlot.venue]}
          </div>
          {selectedSlot.indoor && (
            <div className="mt-2 flex w-fit items-center gap-2 rounded-full border-2 border-ink bg-ink/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-ink">
              <span aria-hidden="true">🌙</span> INDOOR
            </div>
          )}
          <div className="mt-2 text-sm text-muted-foreground">
            {selectedSlot.duration} minutes ·{" "}
            {participantsFor(selectedSlot).length}/{groupMin(selectedSlot.start)} students
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
              (() => {
                const r = ratesFor(
                  selectedSlot.venue,
                  Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", hour12: false }).format(selectedSlot.start)),
                );
                return (
                  <>
                    <div className="text-xs text-ink/60 mb-1">{VENUE_LABEL[selectedSlot.venue]} · {r.period}</div>
                    <ul className="space-y-1 text-sm">
                      {r.rates.map((x) => (
                        <li key={x.n} className="flex justify-between gap-3">
                          <span className="text-ink/70">{x.n}</span>
                          <span className="font-display shrink-0">{x.p} / pers</span>
                        </li>
                      ))}
                    </ul>
                    {r.nonMemberExtra > 0 && (
                      <div className="mt-2 text-xs text-ink/60">Non-members: +€{r.nonMemberExtra} per person</div>
                    )}
                  </>
                );
              })()
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
                  { key: "total_beginner", label: "Total beginner", hint: "less than 10 hours of tennis in my life" },
                  { key: "beginner", label: "Beginner", hint: "I know the basics and can rally a bit" },
                  { key: "intermediate", label: "Intermediate", hint: "more than 6 months of tennis with training" },
                  { key: "advanced", label: "Advanced", hint: "years of experience, match play" },
                ] as { key: Level; label: string; hint: string }[]).map((lv) => (
                  <button
                    type="button"
                    key={lv.key}
                    onClick={() => setLevel(lv.key)}
                    className={`w-full px-4 py-3 rounded-2xl border-2 text-left transition ${
                      level === lv.key
                        ? "bg-clay text-primary-foreground border-clay"
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

            {(() => {
              const existing = myBookings.find(
                (b) => new Date(b.starts_at).getTime() === selectedSlot.start.getTime(),
              );
              if (!existing) return null;
              return (
                <button
                  type="button"
                  disabled={cancellingId === existing.id || !existing.cancellable}
                  onClick={() => cancelOne(existing.id)}
                  className="mt-3 px-7 py-5 rounded-2xl bg-destructive text-destructive-foreground font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {cancellingId === existing.id
                    ? "Cancelling…"
                    : existing.cancellable
                      ? "Cancel my booking ❌"
                      : "Cannot cancel — less than 24h"}
                </button>
              );
            })()}

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
                You can cancel your booking directly here or under “My bookings”. Only you can
                cancel your own sessions. Later than 24h before the start, cancellation is not
                possible.
              </p>
            </div>



            <p className="text-xs text-muted-foreground">
              Rain policy: 50% refund or reschedule.
            </p>

          </form>
        </Modal>
      )}

      {cancelId && (
        <Modal onClose={() => setCancelId(null)}>
          <h3 className="font-display text-2xl uppercase leading-tight">Confirm cancellation</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            For your security, enter your account password. Nobody else can cancel your session.
          </p>
          <label className="mt-4 block text-sm font-semibold">Your password</label>
          <input
            type={cancelShowPassword ? "text" : "password"}
            value={cancelPassword}
            autoComplete="current-password"
            onChange={(e) => setCancelPassword(e.target.value)}
            className="mt-1 w-full px-4 py-3.5 rounded-2xl border-2 border-ink/10 bg-background"
          />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cancelShowPassword}
              onChange={(e) => setCancelShowPassword(e.target.checked)}
            />
            Show password
          </label>
          <button
            type="button"
            disabled={cancellingId === cancelId}
            onClick={confirmCancel}
            className="mt-5 w-full px-7 py-4 rounded-2xl bg-destructive text-destructive-foreground font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {cancellingId === cancelId ? "Cancelling…" : "Cancel my booking ❌"}
          </button>
          <button
            type="button"
            onClick={() => setCancelId(null)}
            className="mt-3 w-full px-7 py-3.5 rounded-2xl border-2 border-ink/15 font-semibold hover:bg-ball/40 transition"
          >
            Keep my booking
          </button>
        </Modal>
      )}
    </main>
  );
}
