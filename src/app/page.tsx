import type { Metadata } from "next";
import { AtAGlance } from "@/components/home/AtAGlance";
import { ContactClose } from "@/components/home/ContactClose";
import { Experience } from "@/components/home/Experience";
import { Hero } from "@/components/home/Hero";
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
 * The homepage, direct: the opening statement, who Himanshu is at a glance,
 * the Cleartrip role, every project (three flagships as stacking cards,
 * then the rest with their stacks), the skills tied to that work, and
 * contact. The deeper walkthroughs live on the case studies, /about and
 * /lab. Light and dark sections alternate.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <AtAGlance />
      <Experience />
      <Projects />
      <Skills />
      <ContactClose />
      <SectionRail sections={SECTIONS} />
    </>
  );
}
