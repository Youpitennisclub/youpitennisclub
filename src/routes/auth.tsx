import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { claimMyBookings } from "@/lib/bookings.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Student account — Youpi Tennis Club Berlin" },
      {
        name: "description",
        content:
          "Create your student account or sign in to book and cancel your own tennis sessions at Youpi Tennis Club Berlin.",
      },
      { property: "og:title", content: "Student account — Youpi Tennis Club" },
      {
        property: "og:description",
        content: "Sign in to manage your own tennis bookings in Berlin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function englishAuthError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Wrong email address or password. Please note: you sign in with your email address, not with a nickname.";
  if (m.includes("email not confirmed")) return "Your email address is not confirmed yet.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email address already exists. Please sign in instead.";
  if (m.includes("password should be at least"))
    return "Your password must be at least 6 characters long.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Please enter a valid email address.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("network") || m.includes("failed to fetch"))
    return "Network error. Please check your connection and try again.";
  return raw;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/book" });
    });
  }, [navigate]);

  const inputCls =
    "w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition";

  const forgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address first, then click “Forgot your password?”.");
      return;
    }
    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent — please check your inbox.");
    } catch (err) {
      toast.error(englishAuthError(err instanceof Error ? err.message : "Something went wrong."));
    } finally {
      setResetting(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/book`,
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              phone: phone.trim(),
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (signInErr) throw signInErr;
        }
        await claimMyBookings({});
        toast.success("Account created 🎾");
        navigate({ to: "/book" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        await claimMyBookings({});
        toast.success("Welcome back 🎾");
        navigate({ to: "/book" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(englishAuthError(msg));
    } finally {
      setBusy(false);
    }
  };


  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
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

      <section className="max-w-md mx-auto px-5 sm:px-6 py-10">
        <h1 className="font-display text-3xl sm:text-4xl uppercase leading-none">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account keeps your bookings in one place. You can cancel your own sessions —
          and only yours — up to 24h before they start.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          {mode === "signup" && (
            <>
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
                type="tel"
                maxLength={30}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className={inputCls}
              />
            </>
          )}
          <div className="grid gap-1">
            <input
              required
              type="email"
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address (your login)"
              className={inputCls}
            />
            <p className="text-xs text-muted-foreground">
              You sign in with your <b>email address</b> — not with a nickname. Your first name is
              only your display name on the calendar.
            </p>
          </div>
          <input
            required
            type={showPassword ? "text" : "password"}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 6 characters)"
            className={inputCls}
          />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 accent-court"
            />
            Show password
          </label>
          <button
            type="submit"
            disabled={busy}
            className="mt-2 px-7 py-4 rounded-2xl bg-violet text-violet-foreground font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in 🎾" : "Create my account 🎾"}
          </button>
          {mode === "signin" && (
            <button
              type="button"
              onClick={forgotPassword}
              disabled={resetting}
              className="text-sm font-semibold underline text-left disabled:opacity-50"
            >
              {resetting ? "Sending reset link…" : "Forgot your password?"}
            </button>
          )}

        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 text-sm font-semibold underline"
        >
          {mode === "signin"
            ? "No account yet? Create one"
            : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}
