"use client";

import { motion } from "motion/react";
import { useId, useReducer, useRef, type ButtonHTMLAttributes, type ReactNode, type RefObject } from "react";
import { smartShelfKart } from "@/content/projects";
import { questionPath, systemLayers } from "@/content/surface-system";
import type { LayerId } from "@/content/types";
import { SskOverviewArt } from "@/components/art/SmartShelfKartArt";
import { AssistantPlaneArt, ReportingPlaneArt, RulesPlaneArt, type PipelineStage } from "@/components/art/SystemPlanesArt";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import { Play } from "@/components/ui/icons";
import { explorerReducer, initialExplorerState, type View } from "@/lib/surface-system";

const overviewAlt = smartShelfKart.media.find((m) => m.id === "ssk-overview")!.alt;

/** Which drawn pipeline stage lights up for each step of the question. */
const pipelineForStep: Record<string, PipelineStage> = {
  verify: "verify",
  facts: "facts",
  cache: "cache",
  route: "router",
  answer: "bank",
};

// Exploded-stack geometry. Planes are 78% of the stage wide at 16:10, so a
// plane is 48.75% of the stage width tall; offsets are fractions of that.
const PLANE_HEIGHT_CQW = 48.75;
const SPACING = 0.42;
const offsetFor = (index: number) => (index - (systemLayers.length - 1) / 2) * SPACING;
const topFor = (index: number) => `calc(50% + ${(offsetFor(index) * PLANE_HEIGHT_CQW).toFixed(2)}cqw)`;
// The stage is 100:90, so the same offsets as a share of the stage's height —
// animatable as a plain percentage translate.
const STAGE_HEIGHT_CQW = 90;
const railShift = (index: number) => `${((offsetFor(index) * PLANE_HEIGHT_CQW) / STAGE_HEIGHT_CQW) * 100}%`;

function PlaneArt({ id, stepId }: { id: LayerId; stepId: string | null }) {
  switch (id) {
    case "client":
      return <SskOverviewArt label={overviewAlt} />;
    case "assistant":
      return <AssistantPlaneArt active={stepId ? pipelineForStep[stepId] : null} />;
    case "reporting":
      return <ReportingPlaneArt />;
    case "rules":
      return <RulesPlaneArt reading={stepId === "facts"} />;
  }
}

export function SurfaceSystem() {
  const [state, dispatch] = useReducer(
    (s: typeof initialExplorerState, a: Parameters<typeof explorerReducer>[1]) => explorerReducer(s, a, questionPath),
    initialExplorerState,
  );
  const { reduced } = useMotionPreference();
  const followRef = useRef<HTMLButtonElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const baseId = useId();

  const step = state.step === null ? null : questionPath[state.step];
  const system = state.view === "system";
  const transition = reduced ? { duration: 0 } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const };

  const setView = (view: View) => dispatch({ type: "view", view });
  const follow = () => {
    dispatch({ type: "follow" });
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
  };
  const stop = () => {
    dispatch({ type: "stop" });
    requestAnimationFrame(() => followRef.current?.focus());
  };

  const emphasis = (id: LayerId) => {
    if (step) return step.layer === id ? "active" : "muted";
    return system && state.layer === id ? "selected" : "normal";
  };

  return (
    <section id="system" aria-labelledby="system-title" className="section-y overflow-clip bg-ink">
      <div className="container-page">
        <header className="max-w-3xl">
          <p data-reveal className="text-eyebrow text-accent-bright">
            Surface / System
          </p>
          <h2 id="system-title" data-reveal className="mt-4 text-display text-[clamp(2.25rem,5.6vw,4.5rem)] text-balance">
            See what&rsquo;s under the surface.
          </h2>
          <p data-reveal className="text-lede mt-5 text-muted-inverse">
            Take SmartShelfKart apart. Switch views, choose a layer, or follow a single question from the screen to its
            answer.
          </p>
        </header>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <div role="group" aria-label="View" className="relative grid grid-cols-2 rounded-full bg-white/6 p-1 ring-1 ring-white/10 ring-inset">
            <span
              aria-hidden="true"
              className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-fg-inverse transition-transform duration-300 ease-(--ease-out) ${
                system ? "translate-x-full" : ""
              }`}
            />
            {(["product", "system"] as const).map((view) => (
              <button
                key={view}
                type="button"
                aria-pressed={state.view === view}
                onClick={() => setView(view)}
                className={`relative min-h-10 rounded-full px-4 text-sm font-medium transition-colors duration-200 ${
                  state.view === view ? "text-ink" : "text-muted-inverse hover:text-fg-inverse"
                }`}
              >
                {view === "product" ? "Product view" : "System view"}
              </button>
            ))}
          </div>
          <button
            ref={followRef}
            type="button"
            onClick={follow}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-accent-bright ring-1 ring-accent-bright/40 ring-inset transition-colors duration-200 hover:bg-accent-bright/10"
          >
            <Play className="size-3.5" />
            {step ? "Restart the question" : "Follow a question"}
          </button>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[1.45fr_1fr] lg:items-center lg:gap-14">
          {/* Large screens: the exploded 3D stack. */}
          <div aria-hidden="true" className="@container relative hidden aspect-[100/90] lg:block">
            {systemLayers.map((layer, i) => {
              const look = emphasis(layer.id);
              const hiddenInProduct = !system && layer.id !== "client";
              return (
                <div
                  key={layer.id}
                  className="absolute inset-0 grid place-items-center [perspective:2200px]"
                  style={{ zIndex: systemLayers.length - i }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      y: system ? `${offsetFor(i) * 100}%` : "0%",
                      rotateX: system ? 58 : 0,
                      rotateZ: system ? -9 : 0,
                      scale: system ? 0.94 : 1,
                      opacity: hiddenInProduct ? 0 : look === "muted" ? 0.38 : 1,
                    }}
                    transition={{ ...transition, delay: reduced ? 0 : system ? i * 0.05 : (systemLayers.length - i) * 0.03 }}
                    onClick={() =>
                      system ? dispatch({ type: "layer", layer: layer.id }) : setView("system")
                    }
                    className={`w-[78%] cursor-pointer rounded-[1.4cqw] outline-offset-4 transition-[outline-color] duration-300 ${
                      hiddenInProduct ? "pointer-events-none" : ""
                    } ${look === "active" || look === "selected" ? "outline-2 outline-accent-bright" : "outline-2 outline-transparent"}`}
                  >
                    <PlaneArt id={layer.id} stepId={step?.id ?? null} />
                  </motion.div>
                </div>
              );
            })}

            {/* Layer labels and the request rail, aligned to plane centres. */}
            {systemLayers.map((layer, i) => (
              <motion.div
                key={layer.id}
                initial={false}
                animate={{ opacity: system ? 1 : 0, x: system ? 0 : -12 }}
                transition={{ ...transition, delay: reduced || !system ? 0 : 0.25 + i * 0.05 }}
                onClick={() => dispatch({ type: "layer", layer: layer.id })}
                className={`absolute left-0 z-10 -translate-y-1/2 cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ring-1 backdrop-blur-md transition-colors ${
                  system ? "" : "pointer-events-none"
                } ${
                  emphasis(layer.id) === "active" || emphasis(layer.id) === "selected"
                    ? "bg-accent-bright text-ink ring-accent-bright"
                    : "bg-ink/70 text-fg-inverse ring-white/15"
                }`}
                style={{ top: topFor(i) }}
              >
                {layer.name}
              </motion.div>
            ))}

            <motion.div
              initial={false}
              animate={{ opacity: step ? 1 : 0 }}
              transition={transition}
              className="pointer-events-none absolute right-[1%] z-10 w-px bg-linear-to-b from-accent-bright/0 via-accent-bright/50 to-accent-bright/0"
              style={{ top: topFor(0), bottom: `calc(100% - ${topFor(systemLayers.length - 1)})` }}
            />
            {step && (
              <motion.div
                initial={false}
                animate={{ y: railShift(systemLayers.findIndex((l) => l.id === step.layer)) }}
                transition={transition}
                className="pointer-events-none absolute inset-0 z-10"
              >
                <span className="absolute top-1/2 right-[1%] size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-bright shadow-[0_0_0_6px_rgb(92_164_255/0.2),0_0_24px_rgb(92_164_255/0.8)]" />
              </motion.div>
            )}
          </div>

          {/* Phones and tablets: flat, labelled layers. */}
          <div aria-hidden="true" className="lg:hidden">
            {system ? (
              <ol className="grid gap-4">
                {systemLayers.map((layer) => {
                  const look = emphasis(layer.id);
                  return (
                    <li
                      key={layer.id}
                      onClick={() => dispatch({ type: "layer", layer: layer.id })}
                      className={`rounded-[1.25rem] p-2 transition-opacity duration-300 ${
                        look === "muted" ? "opacity-40" : ""
                      } ${look === "active" || look === "selected" ? "ring-2 ring-accent-bright" : "ring-1 ring-white/10"}`}
                    >
                      <p className="flex items-baseline justify-between gap-3 px-2 pt-1 pb-2.5 text-sm">
                        <span className="font-semibold">{layer.name}</span>
                        <span className="truncate text-xs text-dim-inverse">{layer.tech}</span>
                      </p>
                      <PlaneArt id={layer.id} stepId={step?.id ?? null} />
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div onClick={() => setView("system")} className="cursor-pointer">
                <SskOverviewArt label={overviewAlt} />
              </div>
            )}
          </div>

          <Panel
            state={state}
            step={step}
            dispatch={dispatch}
            onStop={stop}
            stepHeadingRef={stepHeadingRef}
            baseId={baseId}
          />
        </div>

        <details className="group mt-14 border-t border-white/10 pt-6 text-muted-inverse">
          <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-fg-inverse">
            Read the whole architecture as text
          </summary>
          <div className="mt-6 grid gap-10 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-fg-inverse">The layers</h3>
              <dl className="mt-4 grid gap-4">
                {systemLayers.map((layer) => (
                  <div key={layer.id}>
                    <dt className="font-medium text-fg-inverse">
                      {layer.name} <span className="font-normal text-dim-inverse">— {layer.tech}</span>
                    </dt>
                    <dd className="mt-1 leading-relaxed">
                      {layer.summary} {layer.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="font-semibold text-fg-inverse">One question, step by step</h3>
              <ol className="mt-4 grid list-decimal gap-3 pl-5">
                {questionPath.map((s) => (
                  <li key={s.id} className="leading-relaxed">
                    <span className="font-medium text-fg-inverse">{s.label}.</span> {s.body}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}

type PanelProps = {
  state: typeof initialExplorerState;
  step: (typeof questionPath)[number] | null;
  dispatch: (action: Parameters<typeof explorerReducer>[1]) => void;
  onStop: () => void;
  stepHeadingRef: RefObject<HTMLHeadingElement | null>;
  baseId: string;
};

function Panel({ state, step, dispatch, onStop, stepHeadingRef, baseId }: PanelProps) {
  const current = state.step;
  if (step && current !== null) {
    const last = current === questionPath.length - 1;
    return (
      <div className="rounded-[1.75rem] bg-ink-2 p-6 ring-1 ring-white/8 md:p-8">
        <p className="text-eyebrow text-accent-bright">
          Follow a question · Step {current + 1} of {questionPath.length}
        </p>
        <div aria-live="polite" className="mt-4 min-h-[9.5rem]">
          <h3 ref={stepHeadingRef} tabIndex={-1} className="text-title text-2xl outline-none">
            {step.label}
          </h3>
          <p className="mt-3 leading-relaxed text-muted-inverse">{step.body}</p>
        </div>
        <ol className="mt-6 flex flex-wrap gap-1.5" aria-label="Steps">
          {questionPath.map((s, i) => (
            <li
              key={s.id}
              aria-current={i === current ? "step" : undefined}
              className={`rounded-full px-2.5 py-1 text-xs ${
                i === current
                  ? "bg-accent-bright font-semibold text-ink"
                  : i < current
                    ? "bg-white/12 text-fg-inverse"
                    : "bg-white/5 text-dim-inverse"
              }`}
            >
              {s.label}
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-2">
          <PanelButton onClick={() => dispatch({ type: "prev" })} disabled={current === 0}>
            Previous
          </PanelButton>
          <PanelButton primary onClick={() => dispatch(last ? { type: "follow" } : { type: "next" })}>
            {last ? "Start over" : "Next step"}
          </PanelButton>
          <PanelButton onClick={onStop}>Done</PanelButton>
        </div>
      </div>
    );
  }

  const system = state.view === "system";
  return (
    <div className="rounded-[1.75rem] bg-ink-2 p-6 ring-1 ring-white/8 md:p-8">
      <p className="leading-relaxed text-muted-inverse">
        {system
          ? "Four runtimes, each trusted to a different degree. Choose a layer to see what it does."
          : "The surface: the Flutter app people use every day. Choose a layer to see what sits underneath."}
      </p>
      <ul className="mt-5 divide-y divide-white/8">
        {systemLayers.map((layer) => {
          const open = system && state.layer === layer.id;
          const regionId = `${baseId}-${layer.id}`;
          return (
            <li key={layer.id}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={regionId}
                onClick={() => dispatch({ type: "layer", layer: layer.id })}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left"
              >
                <span>
                  <span className={`block font-semibold ${open ? "text-accent-bright" : "text-fg-inverse"}`}>{layer.name}</span>
                  <span className="block text-sm text-dim-inverse">{layer.tech}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-7 flex-none place-items-center rounded-full text-lg leading-none ring-1 ring-white/15 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              <Collapse id={regionId} open={open}>
                <p className="font-medium text-fg-inverse">{layer.summary}</p>
                <p className="mt-2 leading-relaxed text-muted-inverse">{layer.body}</p>
              </Collapse>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Grows open and shut; closed, it is inert and invisible, as `hidden` was (see .disclosure). */
function Collapse({ id, open, children }: { id: string; open: boolean; children: ReactNode }) {
  return (
    <div id={id} inert={!open} data-open={open || undefined} className="disclosure">
      <div>
        <div className={`pb-5 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}>{children}</div>
      </div>
    </div>
  );
}

function PanelButton({
  children,
  primary,
  ...props
}: { children: ReactNode; primary?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
        primary
          ? "bg-fg-inverse text-ink hover:bg-white"
          : "text-fg-inverse ring-1 ring-white/20 ring-inset enabled:hover:bg-white/8"
      }`}
    >
      {children}
    </button>
  );
}
