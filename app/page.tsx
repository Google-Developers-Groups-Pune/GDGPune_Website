import { About } from "@/components/About";
import { ChapterVideo } from "@/components/ChapterVideo";
import { Events } from "@/components/Events";
import { Focus } from "@/components/Focus";
import { Hero } from "@/components/Hero";
import { JoinCta } from "@/components/JoinCta";
import { Organizers } from "@/components/Organizers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <About />
        <Focus />
        <Events />
        <Organizers />
        <ChapterVideo />
        <JoinCta />
      </main>
      <SiteFooter />
    </>
  );
}
