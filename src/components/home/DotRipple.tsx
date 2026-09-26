"use client";

import { useEffect, useRef } from "react";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import { discover } from "@/lib/explored";

/**
 * Tap the practice dots and a ring of light runs out through them from the
 * tap: each dot it passes lights blue and swells, then settles. Drawn on a
 * canvas laid exactly over the dots (the drawing is `cols` × `rows` dots on
 * a 10-unit grid, centred in its box), for about a second, only after a tap:
 * nothing is drawn, or even created, until then. Off under reduced motion.
 */
export function DotRipple({ cols, rows }: { cols: number; rows: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host || reduced) return;
    let frame = 0;

    const onDown = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      const box = host.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      // The drawing's scale and offset inside the box (preserveAspectRatio: xMidYMid meet).
      const unit = Math.min(box.width / (cols * 10), box.height / (rows * 10));
      const ox = (box.width - cols * 10 * unit) / 2;
      const oy = (box.height - rows * 10 * unit) / 2;
      const x0 = event.clientX - box.left;
      const y0 = event.clientY - box.top;
      const far = Math.hypot(Math.max(x0, box.width - x0), Math.max(y0, box.height - y0));
      const width = 26 * unit;
      const start = performance.now();
      const duration = 1500;
      discover("ripple");

      const draw = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const radius = (1 - (1 - t) ** 2) * (far + width);
        ctx.clearRect(0, 0, box.width, box.height);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = ox + (c * 10 + 5) * unit;
            const y = oy + (r * 10 + 5) * unit;
            const near = 1 - Math.abs(Math.hypot(x - x0, y - y0) - radius) / width;
            if (near <= 0) continue;
            ctx.globalAlpha = near * (1 - t * 0.6);
            ctx.fillStyle = "#0a66d8";
            ctx.beginPath();
            ctx.arc(x, y, 2.1 * unit * (1 + near * 0.9), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (t < 1) frame = requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, box.width, box.height);
      };
      frame = requestAnimationFrame(draw);
    };

    host.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointerdown", onDown);
    };
  }, [reduced, cols, rows]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
