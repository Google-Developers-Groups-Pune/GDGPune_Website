import { site } from "@/data/site";
import { ButtonLink } from "./ButtonLink";
import { DashField } from "./DashField";
import { DevFestBraceField } from "./DevFestBraceField";
import { ParticleBurst } from "./ParticleBurst";

export function DevFestHeroPanel() {
  return (
    <div
      data-antigravity-trigger
      className="relative isolate h-[550px] overflow-visible lg:h-[650px]"
    >
      <DashField count={700} wide />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-6 text-center">
        <div
          data-dotshape="braces"
          className="devfest-content-float pointer-events-auto flex flex-col items-center gap-6"
        >
          <DevFestBraceField />
          <ParticleBurst showBurst={false} headlineSelector="[data-dfb-type]" />
          <h2
            data-dashfield-clear-zone
            data-dfb-type
            className="text-[clamp(2rem,4.2vw,3.75rem)] leading-[.99] font-semibold tracking-[-.065em] whitespace-nowrap text-ink"
          >
            <span className="devfest-title-word devfest-title-word-1">
              DevFest
            </span>{" "}
            <span className="devfest-title-word devfest-title-word-2">
              Pune
            </span>{" "}
            <span className="devfest-title-word devfest-title-word-3 text-google-blue">
              2026
            </span>
          </h2>
          <p
            data-dashfield-clear-zone
            className="-mt-2 max-w-[46ch] text-sm font-medium tracking-tight text-fg-muted sm:text-base"
          >
            Build, Secure, Scale — Agentic AI, Tokenization &amp; Quantum.
          </p>
          <ButtonLink
            href={site.devfestUrl}
            size="lg"
            data-dashfield-clear-zone
            className="devfest-register-reveal pointer-events-auto"
          >
            Register Now
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
