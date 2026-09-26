import type { Metadata } from "next";
import { places } from "@/content/places";
import { DidYouMean } from "@/components/notfound/DidYouMean";
import { FixTheLink } from "@/components/notfound/FixTheLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import s from "./not-found.module.css";

export const metadata: Metadata = { title: "Page not found" };

/** The 404: a broken link to mend, and the places the address might have meant. */
export default function NotFound() {
  return (
    <section className="container-page grid min-h-[80svh] content-center pt-(--nav-h) pb-16">
      <FixTheLink idle={{ half: s.half, left: s.left, right: s.right, spark: s.spark }} />
      <p className="mt-8 text-eyebrow text-accent-bright">404</p>
      {/* Two lines on phones whatever the font, so its arrival moves nothing. */}
      <h1 className="mt-4 text-display text-[clamp(2.5rem,7vw,5.5rem)] max-sm:max-w-[7.5em]">Nothing lives here.</h1>
      <p className="text-lede mt-5 max-w-xl text-muted-inverse">
        The page you were looking for doesn&rsquo;t exist — or hasn&rsquo;t been built yet.
      </p>
      <DidYouMean places={places} />
      <div className="mt-8">
        <ButtonLink href="/">Back to the homepage</ButtonLink>
      </div>
    </section>
  );
}
