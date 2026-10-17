import { devfestVideos } from "@/data/site";
import { SectionHeading } from "./SectionHeading";

export function DevFestVideo() {
  return (
    <section
      id="devfest-vibe"
      aria-labelledby="devfest-vibe-title"
      className="page-container section-y flex flex-col gap-9 border-t border-line"
    >
      <div className="flex flex-col gap-4">
        <SectionHeading id="devfest-vibe-title">
          Experience the <strong className="font-bold">DevFest Pune vibe.</strong>
        </SectionHeading>
        <p className="max-w-3xl text-[17px] leading-[1.55] text-pretty text-fg-muted">
          Where builders unite: Build, Secure, and Scale the future with Agentic AI, Tokenization, and Quantum.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {devfestVideos.map((video) => (
          <div
            key={video.id}
            className="relative aspect-video w-full overflow-hidden rounded-[20px] border border-line bg-surface shadow-[0_2px_12px_rgba(60,64,67,.04)] transition-all hover:border-line-strong hover:shadow-md"
          >
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?start=${video.start}`}
              title={video.title}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
