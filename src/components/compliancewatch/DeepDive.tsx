import type { ReactNode } from "react";
import type { Project } from "@/content/types";
import { LazyVisual } from "@/components/visuals/LazyVisual";
import { Gates } from "./Gates";
import { ScreenGallery } from "./ScreenGallery";
import { ServiceMap } from "./ServiceMap";

/**
 * The rest of ComplianceWatch, after its scene and its rules engine: three
 * more of its rules to try (the quote check, the delivery policy, the model
 * gateway), the system they run on, the screens people use, and what every
 * change has to pass. The main project gets the whole tour.
 */
export function DeepDive({ project }: { project: Project }) {
  const accent = project.accent;
  return (
    <section id="inside" aria-labelledby="inside-title" className="pb-(--section-y)">
      <div className="container-page">
        <div className="max-w-3xl border-t border-white/10 pt-(--section-y)">
          <p className="text-eyebrow" style={{ color: accent }}>
            Inside ComplianceWatch
          </p>
          <h2 id="inside-title" className="mt-4 text-display text-[clamp(2.25rem,5vw,4rem)] text-balance">
            Everything it does, and how it keeps itself honest.
          </h2>
          <p className="text-lede mt-5 text-muted-inverse">
            Three more of its rules to try, the ten services they run on, the screens people use, and what every change has to pass before it merges.
          </p>
        </div>

        {/* One column that never grows to its content: the screens' swipe row is as wide as all eight. */}
        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-(--section-y)">
          <Part n={1} id="answers" accent={accent} title="Answers with receipts" body="Every question is answered in layers — the business's own obligations first, then a plan over the knowledge graph, then search — and every quote in the answer is checked against its clause before it goes out. Here, you write the model's quote.">
            <LazyVisual id="cw-answers" />
          </Part>
          <Part n={2} id="reminders" accent={accent} title="Reminders that know when to speak" body="A change waits five minutes for others to join it, then for the owner's quiet hours to end; inside WhatsApp's 24-hour window it goes as text, outside it as an approved template, and if WhatsApp can't deliver, email does. Reply in Hindi and the bot answers in Hindi.">
            <LazyVisual id="cw-reminders" />
          </Part>
          <Part n={3} id="gateway" accent={accent} title="One door for every model call" body="No service talks to a model directly. The gateway masks identifiers before text leaves, routes each feature to a primary model with a fallback, opens a circuit breaker on repeated failures, and refuses calls over budget.">
            <LazyVisual id="cw-gateway" />
          </Part>
          <Part n={4} id="system" accent={accent} title="Ten services, one backbone" body="Each service owns its own Postgres schema and talks to the others through events written to an outbox in the same transaction as the change, or through an HTTP API with a committed OpenAPI spec. Point at one to see its wires.">
            <ServiceMap accent={accent} />
          </Part>
          <Part n={5} id="screens" accent={accent} title="The screens" body="The web app for owners and CA firms, and the analyst's side. Drawn in the product's own design tokens and words, with sample data for the demo business.">
            <ScreenGallery accent={accent} />
          </Part>
          <Part n={6} id="gates" accent={accent} title="What every change has to pass" body="One required check on every pull request, and it waits for all of these.">
            <Gates accent={accent} />
          </Part>
        </div>
      </div>
    </section>
  );
}

function Part({ n, id, title, body, accent, children }: { n: number; id: string; title: string; body: string; accent: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="min-w-0 scroll-mt-[calc(var(--chrome-h)+1rem)]">
      <div className="mb-8 grid gap-4 md:grid-cols-[4rem_minmax(0,1fr)]">
        <p aria-hidden="true" className="font-mono text-sm tabular-nums" style={{ color: accent }}>
          {String(n).padStart(2, "0")}
        </p>
        <div className="max-w-3xl">
          <h3 id={`${id}-title`} className="text-title text-[clamp(1.75rem,3.4vw,2.75rem)] text-balance">
            {title}
          </h3>
          <p className="mt-3 leading-relaxed text-muted-inverse text-pretty">{body}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
