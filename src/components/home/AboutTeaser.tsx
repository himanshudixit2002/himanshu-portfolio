import { profile } from "@/content/profile";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CapabilityMap } from "@/components/visuals/IdentityVisuals";

/** Scene 07: who's behind the work, with capabilities tied to evidence. */
export function AboutTeaser() {
  return (
    <section id="about" aria-labelledby="about-title" className="section-y border-t border-white/8 bg-ink">
      <div className="container-page grid gap-12">
        <div className="max-w-3xl">
          <p data-reveal className="text-eyebrow text-accent-bright">
            About
          </p>
          <h2 id="about-title" data-reveal className="mt-4 text-display text-[clamp(2.25rem,4.8vw,3.75rem)] text-balance">
            The person behind the work.
          </h2>
          {/* The first paragraph opens the page, in AtAGlance. */}
          {profile.bio.slice(1, 2).map((p) => (
            <p key={p} data-reveal className="mt-5 leading-relaxed text-muted-inverse">
              {p}
            </p>
          ))}
          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/about">More about me</ButtonLink>
            <ButtonLink href="/resume" variant="secondary">
              Résumé
            </ButtonLink>
          </div>
        </div>
        <CapabilityMap />
      </div>
    </section>
  );
}
