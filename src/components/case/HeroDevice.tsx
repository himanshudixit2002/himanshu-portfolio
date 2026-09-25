import Image from "next/image";
import type { ReactNode } from "react";
import type { Project } from "@/content/types";
import { CafeFloorArt, ElepeiaArt } from "@/components/art/ChapterArt";
import { KvTerminalArt } from "@/components/art/KvTerminalArt";
import { SskOverviewArt } from "@/components/art/SmartShelfKartArt";
import { BrowserFrame, DesktopFrame, MacBookFrame } from "@/components/frames/DeviceFrame";
import { MiniVisual } from "@/components/visuals/MiniVisual";
import { VitalsHud } from "@/components/visuals/StaticVisuals";

const alt = (project: Project, id: string) => project.media.find((m) => m.id === id)?.alt;

/**
 * The project on the device it lives on, for the top of its case study. Only
 * projects with a drawing or real screenshots get a device; the rest get
 * their signature mark, large, and their scene below does the showing.
 */
export function HeroDevice({ project }: { project: Project }) {
  const accent = project.accent;
  const wall: [string, string] = [`${accent}66`, "rgb(92 164 255 / 0.22)"];

  switch (project.slug) {
    case "smartshelfkart":
      return (
        <Device caption="Interface illustration with sample data">
          <MacBookFrame wall={wall}>
            <SskOverviewArt label={alt(project, "ssk-overview")!} />
          </MacBookFrame>
        </Device>
      );
    case "elepeia":
      return (
        <Device caption="Interface illustration with sample data — no client photos or records">
          <MacBookFrame wall={[`${accent}55`, "rgb(251 191 36 / 0.14)"]}>
            <ElepeiaArt label={project.media[0].alt} onDark />
          </MacBookFrame>
        </Device>
      );
    case "cue-and-coffee":
      return (
        <Device caption="Interface illustration with sample data" narrow>
          <CafeFloorArt label={project.media[0].alt} />
        </Device>
      );
    case "kvstore":
      return (
        <Device caption="Illustration of a terminal session">
          <MacBookFrame wall={wall}>
            <KvTerminalArt label="Illustration of a KVStore terminal session: SET, GET and DEL commands with their replies." />
          </MacBookFrame>
        </Device>
      );
    case "scopeforge": {
      const shot = project.media[0];
      return (
        <Device caption="Screenshot of the repository's synthetic demo workspace">
          <BrowserFrame url="localhost · ScopeForge" dark page="#141512">
            <Image src={shot.src!} alt={shot.alt} width={shot.width} height={shot.height} sizes="(min-width: 1280px) 1200px, 92vw" className="h-full w-full object-cover object-top" priority />
          </BrowserFrame>
        </Device>
      );
    }
    case "vitals":
      return (
        <Device caption="Illustration of the HUD on a desktop">
          <DesktopFrame app="Vitals" wall={["#4c1d95", "#0c4a6e"]}>
            <div className="absolute top-[7%] right-[4%] w-[30%] min-w-0 [&>div]:max-w-none">
              <VitalsHud glass={false} />
            </div>
          </DesktopFrame>
        </Device>
      );
    default:
      return (
        <div aria-hidden="true" className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-ink-2 ring-1 ring-white/8">
          <div className="absolute inset-0" style={{ background: `radial-gradient(60% 70% at 50% 40%, ${accent}22, transparent 70%)` }} />
          <div className="absolute inset-[12%]">
            <MiniVisual id={project.visual} accent={accent} />
          </div>
        </div>
      );
  }
}

function Device({ children, caption, narrow = false }: { children: ReactNode; caption: string; narrow?: boolean }) {
  return (
    <figure className={`mx-auto w-full ${narrow ? "max-w-3xl" : "max-w-5xl"}`}>
      {children}
      <figcaption className="mt-10 text-center text-xs text-dim-inverse">{caption}</figcaption>
    </figure>
  );
}
