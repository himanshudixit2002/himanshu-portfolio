import type { ReactNode } from "react";
import type { SceneMeta } from "@/lib/scenes/types";
import { SceneCaptions, SceneDots } from "@/components/motion/ScrollScene";
import { SnapGallery } from "@/components/motion/SnapGallery";
import { CardDraw, IdleDraw } from "./IdleDraw";

/**
 * The pinned stage's layout, shared by every scene: kind and step dots on
 * top, then the drawing beside the captions from 768px (captions first, on
 * the left) or above them on phones.
 */
export function SceneStage({ meta, step, accent, children }: { meta: SceneMeta; step: number; accent: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col pt-[calc(var(--chrome-h)+1rem)] pb-6 md:pb-12">
      <div className="container-page flex items-center justify-between gap-4">
        <span className="rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase ring-1 ring-white/12">{meta.kind}</span>
        <SceneDots step={step} count={meta.steps.length} accent={accent} />
      </div>
      <div className="container-page mt-4 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-5 md:mt-8 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:grid-rows-1 md:items-center md:gap-14">
        <div aria-hidden="true" className="relative h-full min-h-0 md:order-2">
          {children}
        </div>
        <SceneCaptions step={step} items={meta.steps} className="min-h-[8.5rem] md:order-1 md:min-h-0" />
      </div>
    </div>
  );
}

/**
 * The scene as static frames, for reduced motion, with every step's
 * caption, so nothing is only told by the animation.
 */
export function SceneFrames({ meta, frames }: { meta: SceneMeta; frames: ReactNode[] }) {
  return (
    <div className="container-page">
      <ol className="grid gap-10 md:gap-14">
        {meta.keyFrames.map((k, i) => (
          <li key={k} className="grid gap-5 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:items-center md:gap-14">
            <div aria-hidden="true" className="aspect-[360/460] rounded-[1.75rem] bg-ink-2 p-4 ring-1 ring-white/8 md:order-2 md:aspect-[640/520] md:p-6">
              <IdleDraw>{frames[i]}</IdleDraw>
            </div>
            <div>
              <p className="text-eyebrow text-dim-inverse">
                {String(k + 1).padStart(2, "0")} / {String(meta.steps.length).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-title text-[clamp(1.375rem,2.4vw,2rem)]">{meta.steps[k].title}</h3>
              <p className="mt-2 leading-relaxed text-muted-inverse">{meta.steps[k].body}</p>
            </div>
          </li>
        ))}
      </ol>
      {meta.keyFrames.length < meta.steps.length && (
        <details className="mt-8 text-sm text-muted-inverse">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-fg-inverse">Every step, as text</summary>
          <ol className="mt-3 grid list-decimal gap-2 pl-5">
            {meta.steps.map((s) => (
              <li key={s.title}>
                <span className="font-medium text-fg-inverse">{s.title}.</span> {s.body}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}

/**
 * Phones, for the densest scenes: every step as a card in a swipeable row —
 * the drawing, then its caption — instead of a pinned stage.
 */
export function StepCards({ meta, label, frames }: { meta: SceneMeta; label: string; frames: ReactNode[] }) {
  const count = String(meta.steps.length).padStart(2, "0");
  const cards = meta.steps.map((step, i) => (
    <article key={step.title} className="flex h-full flex-col rounded-[1.75rem] bg-ink-2 p-4 ring-1 ring-white/8">
      <div aria-hidden="true" className="aspect-[360/480]">
        <CardDraw>{frames[i]}</CardDraw>
      </div>
      <p className="mt-5 text-eyebrow text-dim-inverse">
        {String(i + 1).padStart(2, "0")} / {count}
      </p>
      <h3 className="mt-1.5 text-lg leading-snug font-semibold tracking-[-0.015em] text-balance">{step.title}</h3>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-pretty text-muted-inverse">{step.body}</p>
    </article>
  ));
  return (
    <div className="container-page">
      <SnapGallery label={`${label}, step by step`} items={cards} />
    </div>
  );
}

export type Layout = "wide" | "tall";

/**
 * A drawing in two compositions: `wide` from 768px, `tall` for phones — a
 * portrait layout with type sized to read on a phone, not a shrunk copy.
 * Given `only`, just that one is drawn (the live stage knows the width, and
 * redrawing a hidden twin on every step would be wasted work).
 */
export function Layouts({ wide, tall, only }: { wide: ReactNode; tall: ReactNode; only?: Layout }) {
  if (only) return <div className="h-full">{only === "wide" ? wide : tall}</div>;
  return (
    <>
      <div className="hidden h-full md:block">{wide}</div>
      <div className="h-full md:hidden">{tall}</div>
    </>
  );
}

/** Without JavaScript: the scene's steps as text. Everything the drawings show is in the captions. */
export function SceneSteps({ meta }: { meta: SceneMeta }) {
  return (
    <ol className="container-page grid gap-6 md:grid-cols-2">
      {meta.steps.map((step, i) => (
        <li key={step.title} className="border-t border-white/10 pt-4">
          <p className="text-eyebrow text-dim-inverse">
            {String(i + 1).padStart(2, "0")} / {String(meta.steps.length).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.015em]">{step.title}</h3>
          <p className="mt-1.5 leading-relaxed text-muted-inverse">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
