import { focusAreas } from "@/data/site";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./SectionHeading";

export function Focus() {
  return (
    <section
      id="vision"
      aria-labelledby="vision-title"
      className="page-container section-y flex flex-col gap-10 border-t border-line"
    >
      <div className="flex flex-col gap-8">
        <SectionHeading id="vision-title" label="Our Vision">
          What we do at <strong className="font-bold">Google Developer Group Pune.</strong>
        </SectionHeading>

        {/* 4 Core Formats */}
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2 rounded-[20px] border border-line-strong bg-white/85 p-5 shadow-[0_2px_12px_rgba(60,64,67,.04)] transition-all hover:border-google-blue hover:shadow-md">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-google-blue" />
              <h3 className="text-[17px] font-bold text-ink">
                Meetups &amp; Tech Talks
              </h3>
            </div>
            <p className="text-[14px] leading-[1.55] text-fg-muted">
              Deep dives into modern software, cloud, AI, and architecture.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-[20px] border border-line-strong bg-white/85 p-5 shadow-[0_2px_12px_rgba(60,64,67,.04)] transition-all hover:border-google-green hover:shadow-md">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-google-green" />
              <h3 className="text-[17px] font-bold text-ink">
                Hands-on Workshops &amp; Codelabs
              </h3>
            </div>
            <p className="text-[14px] leading-[1.55] text-fg-muted">
              Practical, code-and-build learning sessions.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-[20px] border border-line-strong bg-white/85 p-5 shadow-[0_2px_12px_rgba(60,64,67,.04)] transition-all hover:border-google-yellow hover:shadow-md">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-google-yellow" />
              <h3 className="text-[17px] font-bold text-ink">
                Flagship Gatherings
              </h3>
            </div>
            <p className="text-[14px] leading-[1.55] text-fg-muted">
              Large-scale community celebrations, highlighted by our annual flagship conference, DevFest Pune.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-[20px] border border-line-strong bg-white/85 p-5 shadow-[0_2px_12px_rgba(60,64,67,.04)] transition-all hover:border-google-red hover:shadow-md">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-google-red" />
              <h3 className="text-[17px] font-bold text-ink">
                Networking
              </h3>
            </div>
            <p className="text-[14px] leading-[1.55] text-fg-muted">
              Connecting with fellow builders, leaders, and peers in the local tech ecosystem.
            </p>
          </div>
        </div>

        {/* Welcoming community statement */}
        <div className="rounded-[20px] border border-line-strong bg-white/70 p-6 sm:p-7 shadow-[0_2px_12px_rgba(60,64,67,.03)] backdrop-blur-xs">
          <p className="text-[16px] sm:text-[17px] leading-[1.65] text-pretty text-fg-muted">
            Whether you’re a developer writing code, a product manager shaping features, a designer crafting experiences, or an entrepreneur building a venture — you are always welcome here. Join our upcoming events, share your knowledge as a speaker, or connect with us to build the future of tech together.
          </p>
        </div>
      </div>

      {/* 5 Focus Areas Cards */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold tracking-[.14em] uppercase text-fg-subtle">
            Key Focus Areas
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
          {focusAreas.map((area, idx) => (
            <li
              key={area.title}
              className={cn(
                "flex min-h-[210px] flex-col justify-between gap-5 rounded-[22px] p-6 text-ink transition-transform hover:-translate-y-1",
                idx < 3 ? "lg:col-span-2" : "lg:col-span-3",
                area.className,
              )}
            >
              <span className="font-mono text-xs font-semibold tracking-[.06em]">{area.tag}</span>
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] sm:text-[22px] leading-[1.2] font-bold">{area.title}</h3>
                <p className="text-[14px] sm:text-[15px] leading-[1.5] text-[#2c2d30]">{area.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
