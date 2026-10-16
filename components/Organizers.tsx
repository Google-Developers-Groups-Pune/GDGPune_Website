import Image from "next/image";
import { organizers } from "@/data/site";
import { SectionHeading } from "./SectionHeading";
import { SmartLink } from "./SmartLink";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
    </svg>
  );
}

export function Organizers() {
  return (
    <section
      id="team"
      aria-labelledby="team-title"
      className="page-container section-y flex flex-col gap-10 border-t border-line"
    >
      <SectionHeading id="team-title" label="ORGANIZERS">
        The people
        <br />
        <strong className="font-bold">behind GDG Pune.</strong>
      </SectionHeading>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {organizers.map((person) => (
          <li key={person.url} className="flex">
            <div className="group relative flex h-full w-full flex-col items-start gap-4 rounded-[20px] border border-line bg-surface p-5 text-fg transition-all duration-200 hover:border-cyan hover:shadow-sm sm:p-6">
              <SmartLink
                href={person.url}
                aria-label={`View ${person.name}'s GDG profile`}
                className="shrink-0 overflow-hidden rounded-full border-2 border-google-blue bg-line transition-transform duration-200 hover:scale-105"
              >
                <Image
                  src={person.image}
                  alt={`Photo of ${person.name}`}
                  width={176}
                  height={176}
                  sizes="88px"
                  className="size-20 object-cover"
                />
              </SmartLink>

              <div className="flex min-w-0 flex-1 flex-col gap-1 pr-6 sm:pr-0">
                <SmartLink
                  href={person.url}
                  className="text-lg font-bold leading-snug transition-colors hover:text-google-blue"
                >
                  {person.name}
                </SmartLink>
                <span className="font-mono text-xs tracking-[.04em] text-cyan">{person.role}</span>
                {person.company && (
                  <span className="text-xs text-fg-subtle">{person.company}</span>
                )}
              </div>

              {person.linkedin && (
                <SmartLink
                  href={person.linkedin}
                  aria-label={`${person.name} on LinkedIn`}
                  title={`${person.name} on LinkedIn`}
                  className="absolute top-5 right-5 inline-flex size-9 items-center justify-center rounded-full bg-[#0a66c2] text-white shadow-sm transition-all duration-200 hover:bg-[#004182] hover:scale-105 active:scale-95 sm:top-6 sm:right-6"
                >
                  <LinkedInIcon />
                </SmartLink>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
