import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset your password — Youpi Tennis Club Berlin" },
      {
        name: "description",
        content:
          "Choose a new password for your Youpi Tennis Club student account and get back to booking your tennis sessions in Berlin.",
      },
      { property: "og:title", content: "Reset your password — Youpi Tennis Club" },
      {
        property: "og:description",
        content: "Set a new password for your student account.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, follow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const inputCls =
    "w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Your password must be at least 6 characters long.");
      return;
    }
    if (password !== confirm) {
      toast.error("The two passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated — you're signed in 🎾");
      navigate({ to: "/book" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
            to="/auth"
            className="shrink-0 px-4 py-2.5 rounded-full border-2 border-ink/15 text-sm font-semibold hover:bg-ball/40 transition"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="max-w-md mx-auto px-5 sm:px-6 py-10">
        <h1 className="font-display text-3xl sm:text-4xl uppercase leading-none">
          Set a new password
        </h1>

        {!ready ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Open this page from the reset link we emailed you. If the link has expired, request a new
            one from the{" "}
            <Link to="/auth" className="underline font-semibold">
              sign-in page
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-3">
            <input
              required
              type={showPassword ? "text" : "password"}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (min. 6 characters)"
              className={inputCls}
            />
            <input
              required
              type={showPassword ? "text" : "password"}
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
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
              {busy ? "Please wait…" : "Save my new password 🎾"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
