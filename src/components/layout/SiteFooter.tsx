import { MotionToggle } from "@/components/motion/MotionPreferences";
import { XRayToggle } from "@/components/xray/XRay";
import { ArrowUp } from "@/components/ui/icons";
import { Monogram } from "./Monogram";

export function SiteFooter({ name }: { name: string }) {
  return (
    <footer className="site-footer border-t border-white/8 bg-ink pb-[env(safe-area-inset-bottom)] text-sm text-muted-inverse">
      <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5">
          <Monogram />
          <span>
            © {new Date().getFullYear()} {name}
          </span>
        </p>
        <div className="site-footer-controls flex flex-wrap items-center gap-x-6 gap-y-1">
          <MotionToggle />
          <XRayToggle />
          <a
            href="#top"
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
