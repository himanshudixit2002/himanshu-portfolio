import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="container-page grid min-h-[80svh] content-center pt-(--nav-h)">
      <p className="text-eyebrow text-accent-bright">404</p>
      <h1 className="mt-4 text-display text-[clamp(2.5rem,7vw,5.5rem)]">Nothing lives here.</h1>
      <p className="text-lede mt-5 max-w-xl text-muted-inverse">
        The page you were looking for doesn&rsquo;t exist — or hasn&rsquo;t been built yet.
      </p>
      <div className="mt-8">
        <ButtonLink href="/">Back to the homepage</ButtonLink>
      </div>
    </section>
  );
}
