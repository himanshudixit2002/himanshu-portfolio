import type { CSSProperties, ReactNode } from "react";
import s from "./frames.module.css";

type Common = {
  children: ReactNode;
  className?: string;
  /** Sitting on a light surface: lighter shadows. */
  onLight?: boolean;
  style?: CSSProperties;
};

/**
 * A laptop around a window. The screen shows a wallpaper tinted with the
 * project's colours and the window (an existing illustration) floats on it.
 */
export function MacBookFrame({ children, className = "", onLight, style, wall }: Common & { wall?: [string, string] }) {
  const vars = { ...(wall ? { "--wall-a": wall[0], "--wall-b": wall[1] } : {}), ...style } as CSSProperties;
  return (
    <div className={`${s.frame} ${onLight ? s.onLight : ""} ${className}`} style={vars}>
      <div className={s.device}>
        <div className={s.lid}>
          <span className={s.camera} aria-hidden="true" />
          <div className={s.macScreen}>
            {children}
            <span className={s.glare} aria-hidden="true" />
          </div>
        </div>
        <div className={s.base} aria-hidden="true">
          <span className={s.hinge} />
        </div>
      </div>
    </div>
  );
}

/** A phone. Children fill the screen below the status bar. */
export function PhoneFrame({
  children,
  className = "",
  onLight,
  style,
  screen = "#ffffff",
  ink = "#18181b",
  signal = 4,
}: Common & { screen?: string; ink?: string; /** Signal bars, 0–4. */ signal?: 0 | 1 | 2 | 3 | 4 }) {
  const vars = { "--screen": screen, "--screen-fg": ink, ...style } as CSSProperties;
  return (
    <div className={`${s.frame} ${onLight ? s.onLight : ""} ${className}`} style={vars}>
      <div className={`${s.device} ${s.iphone}`}>
        <div className={s.phoneScreen}>
          <span className={s.island} aria-hidden="true" />
          <div className={s.statusBar} aria-hidden="true">
            <span>9:41</span>
            <span className={s.statusIcons}>
              <span className={s.bars} data-signal={signal}>
                <span />
                <span />
                <span />
                <span />
              </span>
              <span className={s.battery} />
            </span>
          </div>
          <div className={s.phoneBody}>{children}</div>
          <span className={s.glare} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/** A browser window. `ratio` is the page viewport's width / height. */
export function BrowserFrame({
  children,
  className = "",
  onLight,
  style,
  url,
  ratio = "16 / 10",
  dark = false,
  page,
}: Common & { url: string; ratio?: string; dark?: boolean; page?: string }) {
  const vars = { "--ratio": ratio, ...(page ? { "--page": page } : {}), ...style } as CSSProperties;
  return (
    <div className={`${s.frame} ${onLight ? s.onLight : ""} ${className}`} style={vars}>
      <div className={`${s.device} ${s.browser} ${dark ? s.darkChrome : ""}`}>
        <div className={s.browserBar} aria-hidden="true">
          <span className={s.light} />
          <span className={s.light} />
          <span className={s.light} />
          <span className={s.url}>{url}</span>
        </div>
        <div className={s.browserBody}>
          {children}
          <span className={s.glare} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/** A Mac desktop with a menu bar; children are placed freely over the wallpaper. */
export function DesktopFrame({
  children,
  className = "",
  onLight,
  style,
  app,
  wall,
}: Common & { app: string; wall?: [string, string] }) {
  const vars = { ...(wall ? { "--wall-a": wall[0], "--wall-b": wall[1] } : {}), ...style } as CSSProperties;
  return (
    <div className={`${s.frame} ${onLight ? s.onLight : ""} ${className}`} style={vars}>
      <div className={`${s.device} ${s.desktop}`}>
        <div className={s.menubar} aria-hidden="true">
          <span>
            <span>{app}</span>
            <span>File</span>
            <span>View</span>
          </span>
          <span>9:41</span>
        </div>
        <div className={s.desktopBody}>{children}</div>
        <div className={s.dock} aria-hidden="true">
          {["#60a5fa", "#f5f5f7", "#34d399", "#fbbf24", "#f472b6", "#a78bfa"].map((c) => (
            <span key={c} style={{ background: c }} />
          ))}
        </div>
        <span className={s.glare} aria-hidden="true" />
      </div>
    </div>
  );
}
