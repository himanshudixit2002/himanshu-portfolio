import { profile } from "@/content/profile";
import { Magnetic } from "@/components/motion/Magnetic";
import { WordReveal } from "@/components/motion/Text";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CopyEmailButton } from "./CopyEmailButton";

export function ContactClose() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      data-xray="Server-rendered · the heading lights word by word as it scrolls · the email button leans toward a fine pointer"
      className="surface-light relative section-y bg-paper text-fg"
    >
      <div className="container-page">
        <h2 id="contact-title" data-reveal className="max-w-4xl text-display text-[clamp(2.5rem,7vw,6rem)] text-balance">
          <WordReveal text="Have something worth building?" mode="scrub" />
        </h2>
        <p data-reveal className="text-lede mt-6 max-w-xl text-muted">
          I&rsquo;m glad to talk about products, systems and the details that make them hold up. Email is the fastest
          way to reach me.
        </p>

        <div data-reveal className="mt-10 flex flex-wrap items-center gap-3">
          <Magnetic>
            <ButtonLink href={`mailto:${profile.email}`} tone="light">
              {profile.email}
            </ButtonLink>
          </Magnetic>
          <CopyEmailButton email={profile.email} />
        </div>

        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-black/10 pt-8">
          {[profile.links.linkedin, profile.links.github].map((link) => (
            <li key={link.href}>
              <ButtonLink href={link.href} tone="light" variant="text" external>
                {link.label}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
