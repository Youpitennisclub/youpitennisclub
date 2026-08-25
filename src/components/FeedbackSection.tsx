import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PhotoPicker } from "@/components/PhotoPicker";

type PublicFeedback = {
  first_name: string;
  last_initial: string | null;
  rating: number;
  comment: string;
  photo_url: string | null;
  created_at: string;
};

export function FeedbackSection() {
  const [items, setItems] = useState<PublicFeedback[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
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
      _last_name: lastName.trim(),
      _rating: rating,
      _comment: comment.trim(),
      _photo_url: photo ?? undefined,
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
    setLastName("");
    setEmail("");
    setPhoto(null);
    setRating(5);
    await load();
  };

  const inputCls =
    "w-full min-w-0 px-4 py-3 rounded-2xl bg-background border-2 border-ink/10 focus:border-court outline-none transition";

  return (
    <section id="feedback" className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
      <h2 className="text-[clamp(1.75rem,7vw,3.5rem)] font-display uppercase mb-3 break-words">
        Feedback
      </h2>
      <p className="text-muted-foreground mb-4 max-w-2xl">
        Already trained with me? Leave a comment — reviews are only possible with the email
        address you used to book a session. Only your first name and the first letter of your last
        name are shown publicly, never your email.
      </p>

      <div className="mb-6 p-5 rounded-3xl bg-card border-2 border-ink/10 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Loved your session? A public Google review helps other players in Berlin find us.
        </p>
        <a
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-6 py-3 rounded-2xl bg-navy text-background font-semibold hover:opacity-90 transition text-center"
        >
          Leave a Google review ⭐
        </a>
      </div>


      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <form
          onSubmit={submit}
          className="grid gap-3 p-5 sm:p-7 rounded-3xl bg-card border-2 border-ink/10"
        >
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
            placeholder="Email used for booking"
            className={inputCls}
          />
          <PhotoPicker
            value={photo}
            onChange={setPhoto}
            hint="Optional — your picture appears next to your review."
          />
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
            className={`${inputCls} resize-y`}
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
                  <div className="flex min-w-0 items-center gap-3">
                    {f.photo_url ? (
                      <img
                        src={f.photo_url}
                        alt={f.first_name}
                        className="h-10 w-10 shrink-0 rounded-full object-cover border-2 border-ink/10"
                      />
                    ) : (
                      <span className="h-10 w-10 shrink-0 rounded-full bg-ball grid place-items-center font-display">
                        {f.first_name.slice(0, 1)}
                      </span>
                    )}
                    <div className="font-display text-lg uppercase truncate">
                      {f.first_name}
                      {f.last_initial ? ` ${f.last_initial}.` : ""}
                    </div>
                  </div>
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
