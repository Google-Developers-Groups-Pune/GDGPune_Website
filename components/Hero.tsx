import { site } from "@/data/site";
import { ButtonLink } from "./ButtonLink";
import { ColorBars } from "./ColorBars";
import { DevFestHeroPanel } from "./DevFestHeroPanel";
import { GdgToggleSwitch } from "./GdgToggleSwitch";
import { ParticleBurst } from "./ParticleBurst";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden"
    >
      <div className="page-container relative z-10 grid grid-cols-1 items-center gap-10 pt-[clamp(48px,8vw,100px)] pb-[clamp(56px,8vw,104px)] lg:min-h-[min(820px,calc(100svh-72px))] lg:grid-cols-12 lg:gap-6">
        <div className="relative z-10 flex flex-col items-start gap-[22px] lg:col-span-6">
          <div className="w-full text-center">
            <p className="text-sm sm:text-base leading-relaxed text-fg-subtle">
              <span className="text-lg sm:text-xl font-bold text-ink select-none leading-none">“</span>
              <span className="font-medium text-fg">A diverse mix of voices leads to better discussions, decisions, and outcomes for everyone.</span>
              <span className="text-lg sm:text-xl font-bold text-ink select-none leading-none">”</span>
              {" "}
              <span className="whitespace-nowrap font-semibold text-fg-muted">— Sundar Pichai</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <GdgToggleSwitch />

            <a
              href="https://maps.app.goo.gl/tu25sgauUXwBRfDb6"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-[34px] items-center rounded-full border border-line-strong bg-white/85 px-3.5 shadow-[0_2px_12px_rgba(60,64,67,.06)] transition-all hover:border-google-blue hover:bg-blue-pale/50"
              title="Open Pune, India in Google Maps"
            >
              <span className="font-mono text-[11px] font-semibold tracking-[.13em] text-fg-muted transition-colors group-hover:text-google-blue">
                पुणे, भारत । Pune, India
              </span>
            </a>
          </div>

          <div data-dotshape="braces" className="hero-title-float relative isolate">
            <ParticleBurst showBurst={false} />
            <h1
              id="hero-title"
              data-dashfield-clear-zone
              data-pb-type
              className="hero-title-reveal relative z-10 max-w-none text-[clamp(2rem,4.2vw,3.75rem)] leading-[.99] font-semibold tracking-[-.065em] text-pretty"
            >
              <span className="block whitespace-nowrap">
                Start <span className="text-google-green">.</span> Build{" "}
                <span className="text-google-yellow">.</span> Grow{" "}
                <span className="text-google-red">.</span>
              </span>
              <span className="block">with the</span>
              <span className="hero-title-accent-reveal block bg-gradient-to-r from-[#4285f4] via-[#1a73e8] to-[#8ab4f8] bg-clip-text text-transparent">
                GDG Pune Community!
              </span>
            </h1>
            <ColorBars
              className="relative z-10 mt-4 gap-2"
              barClassName="h-2 w-[60px]"
            />
          </div>

          <div className="flex max-w-[54ch] flex-col gap-3 text-base leading-[1.65] text-pretty text-fg-muted sm:text-[clamp(15px,1.25vw,17px)]">
            <p>
              Google Developers Group (GDG) is where developers of all levels, interests, and background meet to learn new skills and share passion for technology.
            </p>
            <p>
              GDG Pune provides opportunities to learn and grow, meet fellow developers and other people in tech, and stay in touch with the local tech community.
            </p>
            <p>
              Our mission is to provide an inclusive environment where everyone and anyone interested in tech — from beginner developers to experienced professionals — will get an opportunity for personal and professional growth.
            </p>
          </div>

          <div
            data-dashfield-clear-zone
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <ButtonLink href={site.bevyUrl} size="lg">
              Become a member
            </ButtonLink>
            <ButtonLink
              href="#events"
              variant="outline"
              size="lg"
              className="border-line-strong bg-white hover:border-google-blue hover:bg-blue-pale"
            >
              Explore the community <span aria-hidden="true">↗</span>
            </ButtonLink>
          </div>

          <div className="mt-2 flex items-center gap-2.5 text-sm text-fg-subtle">
            <div aria-hidden="true" className="flex items-center gap-1.5 py-1">
              <span
                className="size-2.5 rounded-full bg-google-blue animate-dot-float"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="size-2.5 rounded-full bg-google-red animate-dot-float"
                style={{ animationDelay: "180ms" }}
              />
              <span
                className="size-2.5 rounded-full bg-google-yellow animate-dot-float"
                style={{ animationDelay: "360ms" }}
              />
              <span
                className="size-2.5 rounded-full bg-google-green animate-dot-float"
                style={{ animationDelay: "540ms" }}
              />
            </div>
            <span className="font-bold text-fg">Curious minds! Shared momentum!</span>
          </div>
        </div>
        <div className="lg:col-span-6">
          <DevFestHeroPanel />
        </div>
      </div>
    </section>
  );
}
