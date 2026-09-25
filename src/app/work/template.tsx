import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/PageTransition";

/** The root template stays mounted between case studies; this one crossfades them. */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
