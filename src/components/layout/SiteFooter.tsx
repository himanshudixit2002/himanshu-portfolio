import { MotionToggle } from "@/components/motion/MotionPreferences";
import { ArrowUp } from "@/components/ui/icons";
import { Monogram } from "./Monogram";

export function SiteFooter({ name }: { name: string }) {
  return (
    <footer className="site-footer border-t border-white/8 bg-ink text-sm text-muted-inverse">
      <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5">
          <Monogram />
          <span>
            © {new Date().getFullYear()} {name}
          </span>
        </p>
        <div className="site-footer-controls flex flex-wrap items-center gap-x-6 gap-y-1">
          <MotionToggle />
          <a
            href="#top"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full transition-colors hover:text-fg-inverse"
          >
            <ArrowUp className="size-4" />
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
