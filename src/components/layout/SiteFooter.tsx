import { MotionToggle } from "@/components/motion/MotionPreferences";
import { XRayToggle } from "@/components/xray/XRay";
import Link from "next/link";
import type { NavItem } from "@/content/types";
import { ArrowUp } from "@/components/ui/icons";
import { Monogram } from "./Monogram";

export function SiteFooter({ name, links }: { name: string; links: NavItem[] }) {
  return (
    <footer className="site-footer border-t border-white/8 bg-ink pb-[env(safe-area-inset-bottom)] text-sm text-muted-inverse">
      {/* Every page, one more time; also the phone menu when script is off. */}
      <nav id="site-nav" aria-label="Site" className="container-page pt-6">
        <ul className="-ml-2 flex flex-wrap">
          {links.map((item) => (
            <li key={item.href}>
              {/* No prefetch: every page would fetch all of these once the footer shows. */}
              <Link href={item.href} prefetch={false} className="inline-flex min-h-11 items-center rounded-full px-2 transition-colors hover:text-fg-inverse active:opacity-70">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="container-page flex flex-col gap-4 pt-2 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="group flex items-center gap-2.5">
          <Monogram className="mono-flip" />
          <span>
            © {new Date().getFullYear()} {name}
          </span>
        </p>
        <div className="site-footer-controls flex flex-wrap items-center gap-x-6 gap-y-1">
          <MotionToggle />
          <XRayToggle />
          <a
            href="#top"
            data-launch=""
            className="group inline-flex min-h-11 items-center gap-1.5 rounded-full transition-colors hover:text-fg-inverse active:opacity-70"
          >
            <ArrowUp className="size-4 transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:-translate-y-0.5" />
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
