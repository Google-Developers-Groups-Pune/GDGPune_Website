import { site } from "@/data/site";
import { SectionHeading } from "./SectionHeading";

export function ChapterVideo() {
  return (
    <section
      id="video"
      aria-labelledby="video-title"
      className="page-container section-y grid items-center gap-9 border-t border-line md:grid-cols-2"
    >
      <div className="flex flex-col gap-4 md:order-2">
        <SectionHeading id="video-title">
          Experience the <strong className="font-bold">community vibe.</strong>
        </SectionHeading>
        <p className="text-[17px] leading-[1.55] text-pretty text-fg-muted">
          See what happens when builders get together — deep technical talks, live coding demos, and powerful connections.
        </p>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-[20px] border border-line bg-surface">
        <iframe
          src={`https://www.youtube.com/embed/${site.videoId}`}
          title="GDG Pune chapter video"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </section>
  );
}
