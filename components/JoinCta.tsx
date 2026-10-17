import { site } from "@/data/site";
import { ButtonLink } from "./ButtonLink";
import { SectionHeading } from "./SectionHeading";

export function JoinCta() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="page-container pb-[clamp(56px,8vw,104px)]">
      <div className="grid items-center gap-8 rounded-[28px] border border-[#d2e3fc] bg-[#f8faff] p-[clamp(28px,5vw,60px)] md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
        <div className="flex flex-col gap-3.5">
          <SectionHeading id="contact-title" className="gap-3.5">
            Never miss an <strong className="font-bold">update!</strong>
          </SectionHeading>
          <p className="text-base leading-normal text-pretty text-fg-muted">
            Join our chapter on Bevy to get regular updates for Meetups, Hands-on Workshops, Codelabs, and flagship conferences like DevFest Pune!
          </p>
          <p className="text-base leading-normal text-pretty text-fg-muted">
            Want to speak, partner or host a meetup? Email us at{" "}
            <a href={`mailto:${site.email}`} className="break-all text-google-blue underline underline-offset-2">
              {site.email}
            </a>
            .
          </p>
          <p className="text-base leading-normal text-pretty text-fg-muted">
            No inbox black holes here—we read and reply to every single message. :)
          </p>
        </div>
        <ButtonLink href={site.bevyUrl} size="lg" className="w-full sm:w-auto">
          Join on Bevy
        </ButtonLink>
      </div>
    </section>
  );
}
