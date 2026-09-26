import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Metric } from "@/content/types";
import { profile } from "@/content/profile";

/**
 * Link-preview images, drawn at build time with next/og: the site's ink, a
 * glow in the page's accent, and the page's own words — nothing a preview
 * says that the page doesn't.
 */

export const ogSize = { width: 1200, height: 630 };
export const ogType = "image/png";

const INK = "#08090b";
const FG = "#f5f5f7";
const MUTED = "#a1a1a6";
const DIM = "#86868b";

/** Himanshu's cut-out photo, read once at build time; without it the preview falls back to the HD mark. */
const PHOTO = (() => {
  try {
    return `data:image/png;base64,${readFileSync(join(process.cwd(), "src/content/media/himanshu.png")).toString("base64")}`;
  } catch {
    return null;
  }
})();

/**
 * Inter at one weight, subset to the text drawn, from Google Fonts (the build
 * already needs it for next/font). Null if it can't be reached; the image then
 * falls back to next/og's own font rather than failing the build.
 */
async function inter(weight: 400 | 600, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const font = await fetch(url);
    return font.ok ? await font.arrayBuffer() : null;
  } catch {
    return null;
  }
}

type Card = {
  accent: string;
  eyebrow: string;
  /** One string, or the lines to break it into. */
  title: string | string[];
  line: string;
  metrics?: Metric[];
};

export async function ogImage({ accent, eyebrow, title, line, metrics = [] }: Card) {
  const shown = metrics.slice(0, 3);
  const lines = typeof title === "string" ? [title] : title;
  const text = ["HD", profile.name, eyebrow, ...lines, line, ...shown.flatMap((m) => [m.value, m.label])].join("");
  const [regular, semibold] = await Promise.all([inter(400, text), inter(600, text)]);
  const fonts = [
    ...(regular ? [{ name: "Inter", data: regular, weight: 400 as const, style: "normal" as const }] : []),
    ...(semibold ? [{ name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 76px",
          background: INK,
          backgroundImage: `radial-gradient(circle at 86% 14%, ${accent}4d 0%, ${accent}14 30%, ${INK}00 58%)`,
          color: FG,
          fontFamily: fonts.length ? "Inter" : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {PHOTO ? (
            <div
              style={{
                display: "flex",
                position: "relative",
                width: 64,
                height: 64,
                overflow: "hidden",
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.22)",
                backgroundImage: "linear-gradient(160deg, #2563eb, #0f766e)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- drawn by next/og, not a page */}
              <img src={PHOTO} width={88} height={88} alt="" style={{ position: "absolute", left: -14, top: -3 }} />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                width: 52,
                height: 52,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 15,
                border: "1.5px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.08)",
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: -0.8,
              }}
            >
              HD
            </div>
          )}
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.3 }}>{profile.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: accent, letterSpacing: 0.4 }}>{eyebrow}</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 18, fontSize: 96, fontWeight: 600, lineHeight: 1, letterSpacing: -3.6 }}>
            {lines.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
          <div style={{ marginTop: 24, fontSize: 38, color: MUTED, letterSpacing: -0.4 }}>{line}</div>
        </div>

        {shown.length > 0 && (
          <div style={{ display: "flex", gap: 56 }}>
            {shown.map((m) => (
              <div key={m.label} style={{ display: "flex", flexDirection: "column", width: 310 }}>
                <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: -1.2 }}>{m.value}</div>
                <div style={{ marginTop: 6, fontSize: 21, lineHeight: 1.3, color: DIM }}>{m.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { ...ogSize, fonts: fonts.length ? fonts : undefined },
  );
}
