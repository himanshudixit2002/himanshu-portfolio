"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import type { Place } from "@/content/places";
import { isTyping } from "@/lib/xray";

/** An entry the server hands the palette: a project or a place to go (content/places). Actions are added on the client. */
export type PaletteEntry = Place;

/** onClose(false) when the palette navigated, so focus isn't pulled back to the old opener. */
export type PaletteProps = { entries: PaletteEntry[]; email: string; onClose: (restoreFocus?: boolean) => void };

const OPEN = "hd-palette-open";

/** Opens the palette from anywhere, such as the header's button. */
export const openPalette = () => window.dispatchEvent(new Event(OPEN));

/**
 * Listens for ⌘K / Ctrl+K and "/" (not while typing), and for the header's
 * button. The palette's code is fetched the first time it opens, so pages
 * carry only this listener. When it closes, focus goes back to whatever
 * opened it.
 */
export function PaletteHost({ entries, email }: { entries: PaletteEntry[]; email: string }) {
  const [Palette, setPalette] = useState<ComponentType<PaletteProps> | null>(null);
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const isOpen = useRef(false);

  const show = useCallback(() => {
    if (isOpen.current) return;
    isOpen.current = true;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    import("./Palette").then(
      (m) => {
        setPalette(() => m.default);
        setOpen(true);
      },
      () => (isOpen.current = false),
    );
  }, []);

  const close = useCallback((restoreFocus = true) => {
    isOpen.current = false;
    setOpen(false);
    // After the dialog has gone: while a modal is open, the page can't take focus.
    if (restoreFocus) requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (isOpen.current) close();
        else show();
      } else if (event.key === "/" && !event.metaKey && !event.ctrlKey && !isTyping(event.target) && !isOpen.current) {
        event.preventDefault();
        show();
      }
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener(OPEN, show);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN, show);
    };
  }, [show, close]);

  return open && Palette ? <Palette entries={entries} email={email} onClose={close} /> : null;
}
