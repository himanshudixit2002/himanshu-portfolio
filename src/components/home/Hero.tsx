import type { CSSProperties } from "react";
import { profile } from "@/content/profile";
import { KvTerminalArt } from "@/components/art/KvTerminalArt";
import { NovaPhoneArt, SskOverviewArt } from "@/components/art/SmartShelfKartArt";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowDown } from "@/components/ui/icons";
import { HeroTilt } from "./HeroTilt";

const rise = (i: number) => ({ "--i": i }) as CSSProperties;
const word = (i: number) => ({ "--w": i }) as CSSProperties;
const depth = (shift: string) => ({ "--sd-shift": shift }) as CSSProperties;

export function Hero() {
  const [first, second] = profile.headline;
  const [firstA, firstB] = first.split(" ");
  const [secondA, secondB] = second.split(" ");

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="hero-scroll relative isolate overflow-hidden bg-ink pt-[calc(var(--nav-h)+clamp(3rem,9vw,7rem))]"
    >
      <div
        aria-hidden="true"
        className="drift pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70rem] bg-[radial-gradient(60rem_36rem_at_70%_18%,rgb(92_164_255/0.14),transparent_70%),radial-gradient(40rem_30rem_at_12%_40%,rgb(45_212_191/0.08),transparent_70%)]"
      />

      <div className="container-page">
        <h1 id="hero-title">
          <span className="hero-rise block text-[0.9375rem] font-semibold text-fg-inverse" style={rise(0)}>
            {profile.name}
          </span>
          {/* Two lines from 640px up, three intentional lines on phones; word by word (WordReveal's entrance), keeping the breaks. */}
          <span
            className="wr-in mt-5 block text-display text-[clamp(2.75rem,8.6vw,7rem)] text-balance"
            style={{ "--wr-delay": "90ms" } as CSSProperties}
          >
            <span className="wr-w" style={word(0)}>
              {firstA}
            </span>
            <br className="sm:hidden" />{" "}
            <span className="wr-w" style={word(1)}>
              {firstB}
            </span>
            <br className="max-sm:hidden" />{" "}
            <span className="wr-w" style={word(2)}>
              {secondA}
            </span>
            <br className="sm:hidden" />{" "}
            <span className="wr-w" style={word(3)}>
              {secondB}
            </span>
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-8 md:mt-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="hero-rise max-w-[36rem]" style={rise(2)}>
            <p className="text-lede text-muted-inverse">{profile.intro}</p>
            <p className="mt-3 text-sm text-dim-inverse">
              {profile.role} · {profile.location}
            </p>
          </div>
          <div className="hero-rise flex flex-wrap gap-3" style={rise(3)}>
            <ButtonLink href="#work">
              Explore my work
              <span className="cue-nudge inline-flex">
                <ArrowDown className="size-4 transition-transform duration-200 group-hover:translate-y-0.5" />
              </span>
            </ButtonLink>
            <ButtonLink href="/resume" variant="secondary">
              View résumé
            </ButtonLink>
          </div>
        </div>
        <div data-nav-sentinel aria-hidden="true" className="h-px" />
      </div>

      <div className="relative mx-auto mt-14 w-full max-w-[90rem] px-(--gutter) md:mt-20">
        {/* Receding and tilting are separate elements: each writes its own transform. */}
        <div className="hero-recede">
          <HeroTilt>
            <div className="hero-settle relative aspect-[100/98] md:aspect-[100/52]">
              {/* Depth on the way out: the phone nearest, the dashboard furthest. */}
              <div
                className="hero-depth absolute top-0 left-[3%] w-[94%] md:left-[13%] md:w-[74%]"
                style={depth("2rem")}
              >
                <SskOverviewArt label="Illustration of the SmartShelfKart dashboard with sample data." />
              </div>
              <div
                className="hero-depth absolute top-[27%] left-[1%] w-[36%] md:top-[31%] md:left-[3%] md:w-[17%]"
                style={depth("9rem")}
              >
                <NovaPhoneArt
                  conversation="low-stock"
                  label="Illustration of the Nova assistant answering “What's running low?” with four sample products."
                />
              </div>
              <div
                className="hero-depth absolute top-[48%] right-[2%] hidden w-[27%] md:block"
                style={depth("5rem")}
              >
                <KvTerminalArt label="Illustration of a KVStore terminal session: SET, GET and DEL commands with their replies." />
              </div>
            </div>
          </HeroTilt>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-b from-transparent to-ink"
        />
      </div>

      <p className="container-page relative pt-4 pb-10 text-right text-xs text-dim-inverse">
        Interface illustrations with sample data
      </p>
    </section>
  );
}
