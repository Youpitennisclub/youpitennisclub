import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";

import sunsetWide from "@/assets/photos/sunset-wide.jpg.asset.json";
import sunsetPlayer from "@/assets/photos/sunset-player.jpg.asset.json";
import sunsetCourts from "@/assets/photos/sunset-courts.jpg.asset.json";

const TITLE = "Photos — Youpi Tennis Club";
const DESCRIPTION =
  "Snapshots from the courts: training moments, club life and sunsets over Berlin's clay with Youpi Tennis Club.";

const PHOTOS = [
  {
    src: sunsetWide.url,
    alt: "Sunset sky in pink and orange over the clay courts at BFC Alemannia, Berlin",
    wide: true,
  },
  {
    src: sunsetPlayer.url,
    alt: "A player sweeping the clay court under a glowing sunset sky",
    wide: false,
  },
  {
    src: sunsetCourts.url,
    alt: "Empty clay tennis courts framed by a fiery sunset",
    wide: false,
  },
];

export const Route = createFileRoute("/photos")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: sunsetWide.url },
      { name: "twitter:image", content: sunsetWide.url },
    ],
    links: [{ rel: "canonical", href: "https://youpitennisclub.com/photos" }],
  }),
  component: PhotosPage,
});

function PhotosPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-16">
        <div className="mb-9 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-clay">Photos</p>
          <h1 className="mb-4 text-4xl font-display uppercase break-words sm:text-6xl">
            Life on <span className="text-pink">the courts</span>
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            A few snapshots from training days and club life in Berlin — often chased by a beautiful sky.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {PHOTOS.map((photo) => (
            <figure
              key={photo.src}
              className={photo.wide ? "overflow-hidden rounded-2xl border-2 border-ink/10 shadow-sm sm:col-span-2" : "overflow-hidden rounded-2xl border-2 border-ink/10 shadow-sm"}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className={photo.wide ? "aspect-[4/3] w-full object-cover sm:aspect-[16/9]" : "aspect-[4/5] w-full object-cover"}
              />
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
