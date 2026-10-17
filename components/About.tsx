import { site } from "@/data/site";
import { SectionHeading } from "./SectionHeading";
import { SmartLink } from "./SmartLink";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="page-container section-y grid gap-10 border-t border-line md:grid-cols-2"
    >
      <SectionHeading id="about-title">
        What are <strong className="font-bold">Google Developer Groups?</strong>
      </SectionHeading>

      <div className="flex flex-col gap-[18px] text-[17px] leading-[1.55] text-pretty text-fg-muted">
        <p>
          <SmartLink href={site.googleCommunityUrl} className="link-inline">
            Google Developer Groups (GDGs)
          </SmartLink>{" "}
          are local communities for developers to connect and learn together. Anyone
          interested in tech — from beginner to experienced developer — is welcome, and every group prides itself on
          being an inclusive environment.
        </p>
        <p>
          There are{" "}
          <SmartLink href={site.communityMapUrl} className="link-inline">
            2,000+ community groups worldwide
          </SmartLink>
          , each named after its city. Groups run meetups, codelabs, study
          jams, hackathons and flagship programs like{" "}
          <SmartLink href={site.buildWithAiUrl} className="link-inline">
            Build with AI
          </SmartLink>{" "}
          and{" "}
          <SmartLink href={site.devfestProgramUrl} className="link-inline">
            DevFest
          </SmartLink>
          , the community-led conference we host each year in Pune.
        </p>
        <p>
          GDG Pune is an independent group; our activities and the opinions expressed here should in no way be linked to Google, the corporation.{" "}
          <SmartLink href={site.gdgProgramUrl} className="link-inline">
            Learn more about the GDG program →
          </SmartLink>
        </p>
      </div>
    </section>
  );
}
