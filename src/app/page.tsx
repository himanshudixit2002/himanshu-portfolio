import type { Metadata } from "next";
import { AtAGlance } from "@/components/home/AtAGlance";
import { ContactClose } from "@/components/home/ContactClose";
import { Experience } from "@/components/home/Experience";
import { Projects } from "@/components/home/Projects";
import { SectionRail } from "@/components/home/SectionRail";
import { Skills } from "@/components/home/Skills";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const SECTIONS = [
  { id: "hello", label: "At a glance" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

/*
 * The homepage, direct: who Himanshu is, first (name, what he does, the way
 * to the work, the portrait, the facts and the practice streak board), then
 * the Cleartrip role, every project (three flagships as stacking cards,
 * then the rest with their stacks), the skills tied to that work, and
 * contact. The deeper walkthroughs live on the case studies, /about and
 * /lab.
 */
export default function Home() {
  return (
    <>
      <AtAGlance />
      <Experience />
      <Projects />
      <Skills />
      <ContactClose />
      <SectionRail sections={SECTIONS} />
    </>
  );
}
