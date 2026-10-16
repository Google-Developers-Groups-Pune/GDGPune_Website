import Image from "next/image";
import { footerChapterLinks, footerProgramLinks, site, type NavLink } from "@/data/site";
import { ColorBars } from "./ColorBars";
import { SmartLink } from "./SmartLink";
import { SocialLinks } from "./SocialLinks";

function FooterColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div className="flex flex-col gap-2.5 text-sm">
      <h2 className="font-mono text-xs tracking-[.06em] text-fg-faint">{title}</h2>
      <ul className="flex flex-col gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <SmartLink
              href={link.href}
              className="inline-block py-1 text-fg-muted transition-colors hover:text-google-blue"
            >
              {link.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="page-container flex flex-col gap-9 border-t border-line pt-12 pb-7">
      <div className="grid grid-cols-2 items-start gap-x-6 gap-y-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <Image
            src="/gdg-pune-logo.svg"
            alt="Google Developer Group Pune"
            width={1920}
            height={390}
            sizes="300px"
            className="h-10 w-auto self-start sm:h-12"
          />
          <p className="max-w-[48ch] text-sm leading-relaxed text-pretty text-fg-subtle">
            A Google Developer Group for builders, innovators, and creators in Pune, India—exploring everything from code and cloud to AI and startups, and shaping the future through community and collaboration.
          </p>
          <SocialLinks />
        </div>
        <FooterColumn title="CHAPTER" links={footerChapterLinks} />
        <FooterColumn title="PROGRAM" links={footerProgramLinks} />
      </div>

      <ColorBars className="gap-1.5" barClassName="h-1 flex-1" />

      <div className="flex flex-col gap-3">
        <p className="max-w-[90ch] text-[13px] leading-[1.55] text-pretty text-fg-subtle">
          <strong className="font-bold text-fg">Disclaimer:</strong> GDG Pune is an independent group; our activities and the opinions expressed here should in no way be linked to Google, the corporation. To learn more about the GDG program, visit{" "}
          <SmartLink href={site.gdgProgramUrl} className="link-inline">
            developers.google.com/community/gdg
          </SmartLink>
          .
        </p>
        <p className="max-w-[90ch] text-[13px] leading-[1.55] text-pretty text-fg-subtle">
          All attendees, speakers, sponsors and volunteers are required to follow the{" "}
          <SmartLink
            href="https://www.google.com/events/policy/anti-harassmentpolicy.html"
            className="link-inline"
          >
            Google Developer Community Guidelines.
          </SmartLink>
        </p>
        <span className="font-mono text-xs text-fg-faint">
          © {new Date().getFullYear()} Google Developer Group Pune
        </span>
      </div>
    </footer>
  );
}
