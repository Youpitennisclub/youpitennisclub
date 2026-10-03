import { createFileRoute } from "@tanstack/react-router";

import { FeedbackBoard, GoogleReviewCard } from "@/components/FeedbackSection";
import { SiteHeader } from "@/components/SiteHeader";

const TITLE = "Leave a review — Youpi Tennis Club Berlin";
const DESCRIPTION =
  "Share how your tennis session went at Youpi Tennis Club in Berlin, or leave a public Google review for other players to find.";

export const Route = createFileRoute("/leave-a-review")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://youpitennisclub.com/leave-a-review" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://youpitennisclub.com/leave-a-review" }],
  }),
  component: LeaveAReviewPage,
});

function LeaveAReviewPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay">
            Your turn to talk
          </p>
          <h1 className="mb-5 text-4xl font-display uppercase break-words sm:text-6xl">
            Leave a <span className="text-clay">review</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Already trained with me? Leave a comment — reviews are only possible with the email
            address you used to book a session. Only your first name and the first letter of your
            last name are shown publicly, never your email.
          </p>
        </div>

        <GoogleReviewCard />
        <FeedbackBoard />
      </section>
    </main>
  );
}
