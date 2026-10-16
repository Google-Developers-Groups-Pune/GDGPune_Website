import { events, site } from "@/data/site";
import { cn } from "@/lib/cn";
import { ButtonLink } from "./ButtonLink";
import { SectionHeading } from "./SectionHeading";
import { SmartLink } from "./SmartLink";

export function Events() {
  return (
    <section
      id="events"
      aria-labelledby="events-title"
      className="page-container section-y flex flex-col gap-8 border-t border-line"
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <SectionHeading id="events-title" label="Meet-ups, Workshop, Hackathon, Conference">
          Recent <strong className="font-bold">highlights.</strong>
        </SectionHeading>
        <ButtonLink href={site.upcomingEventsUrl} variant="outline" size="sm" className="w-full sm:w-auto">
          Upcoming events on Bevy
        </ButtonLink>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <li key={event.url} className="flex">
            <SmartLink
              href={event.url}
              className="group flex min-h-[230px] w-full flex-col gap-3.5 rounded-[20px] border border-line bg-surface p-[22px] text-fg transition-all duration-200 hover:border-cyan hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[13px] text-cyan">{event.date}</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-[5px] font-mono text-[11px] tracking-[.06em] text-ink",
                    event.kindClassName,
                  )}
                >
                  {event.kind}
                </span>
              </div>
              <h3 className="text-[18px] leading-[1.25] font-bold text-pretty transition-colors group-hover:text-google-blue">
                {event.title}
              </h3>
              {event.description && (
                <p className="line-clamp-2 text-xs leading-[1.5] text-fg-subtle">
                  {event.description}
                </p>
              )}
              <p className="mt-auto pt-1 font-mono text-xs leading-[1.45] text-fg-subtle/80">{event.host}</p>
            </SmartLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
