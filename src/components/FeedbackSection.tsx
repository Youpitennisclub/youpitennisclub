import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PublicFeedback = {
  first_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export function FeedbackSection() {
  const [items, setItems] = useState<PublicFeedback[]>([]);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.rpc("get_public_feedback");
    if (!error) setItems((data as PublicFeedback[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.rpc("submit_feedback", {
      _email: email.trim(),
      _first_name: firstName.trim(),
      _rating: rating,
      _comment: comment.trim(),
    });
    setSending(false);
    if (error) {
      toast.error(
        error.message.includes("already booked")
          ? "Only players who already booked a session can leave feedback."
          : "Couldn't send your feedback. Please check your details.",
      );
      return;
    }
    toast.success("Thanks for your feedback! 🎾");
    setComment("");
    setFirstName("");
    setEmail("");
    setRating(5);
    await load();
  };

  return (
    <section id="feedback" className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase mb-3 break-words">
        Feedback
      </h2>
      <p className="text-muted-foreground mb-10 max-w-2xl">
        Already trained with me? Leave a comment — reviews are only possible with the email
        address you used to book a session.
      </p>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <form
          onSubmit={submit}
          className="grid gap-3 p-6 md:p-8 rounded-3xl bg-card border-2 border-ink/10"
        >
          <div className="grid sm:grid-cols-2 gap-3">
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
              type="email"
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email used for booking"
              className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Rating</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                aria-label={`${n} stars`}
                className={`text-2xl leading-none transition ${
                  n <= rating ? "opacity-100" : "opacity-25"
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
          <textarea
            required
            rows={4}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was your session?"
            className="w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition resize-y"
          />
          <button
            type="submit"
            disabled={sending}
            className="mt-1 px-7 py-4 rounded-2xl bg-violet text-violet-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {sending ? "Sending…" : "Leave your feedback"}
          </button>
        </form>

        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground">No feedback yet — be the first one.</p>
          ) : (
            items.map((f, i) => (
              <article
                key={`${f.first_name}-${f.created_at}-${i}`}
                className="p-5 rounded-2xl bg-card border-2 border-ink/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-display text-lg uppercase truncate">{f.first_name}</div>
                  <div className="shrink-0 text-sm">{"⭐".repeat(f.rating)}</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground break-words">{f.comment}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
