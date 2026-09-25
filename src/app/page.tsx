import type { Metadata } from "next";
import { cueAndCoffee, elepeia } from "@/content/projects";
import { CafeFloorArt, ElepeiaArt } from "@/components/art/ChapterArt";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { ContactClose } from "@/components/home/ContactClose";
import { EngineeringScene } from "@/components/home/EngineeringScene";
import { Experience } from "@/components/home/Experience";
import { Hero } from "@/components/home/Hero";
import { InterfaceToImpact } from "@/components/home/InterfaceToImpact";
import { ProjectChapter } from "@/components/home/ProjectChapter";
import { SmartShelfKartChapter } from "@/components/home/SmartShelfKartChapter";
import { SurfaceSystem } from "@/components/home/SurfaceSystem";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/*
 * The homepage storyboard: opening statement, interface to impact, selected
 * work (SmartShelfKart and its Surface / System explorer, Elepeia, Cue &
 * Coffee), experience, the engineering lab, about, and contact.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <InterfaceToImpact />
      <section id="work" aria-labelledby="work-title">
        <h2 id="work-title" className="sr-only">
          Selected work
        </h2>
        <SmartShelfKartChapter />
        <SurfaceSystem />
        <ProjectChapter
          project={elepeia}
          index={2}
          tone="dark"
          art={<ElepeiaArt label={elepeia.media[0].alt} onDark />}
        />
        <ProjectChapter
          project={cueAndCoffee}
          index={3}
          tone="light"
          reverse
          art={<CafeFloorArt label={cueAndCoffee.media[0].alt} />}
        />
      </section>
      <Experience />
      <EngineeringScene />
      <AboutTeaser />
      <ContactClose />
    </>
  );
}
