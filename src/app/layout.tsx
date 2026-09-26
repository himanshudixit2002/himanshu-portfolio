import type { Metadata, Viewport } from "next";
import { Caveat, Inter, JetBrains_Mono } from "next/font/google";
import { navigation, profile, resume } from "@/content/profile";
import { projects } from "@/content/projects";
import { Fx } from "@/components/fx/Fx";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { InlineScript } from "@/components/motion/InlineScript";
import { MotionPreferences } from "@/components/motion/MotionPreferences";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { PaletteHost, type PaletteEntry } from "@/components/palette/PaletteHost";
import { XRayHost } from "@/components/xray/XRay";
import { motionInitScript } from "@/lib/motion-preference";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time by next/font; no request reaches Google at runtime.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
// Only the hand-written notes use it, and they appear late: not preloaded.
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap", preload: false });

const description = `${profile.intro.replace(/\.$/, "")} — ${profile.role.toLowerCase()} based in ${profile.location}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${profile.name} — ${profile.role}`, template: `%s — ${profile.name}` },
  description,
  openGraph: {
    type: "website",
    siteName: profile.name,
    title: `${profile.name} — ${profile.role}`,
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
  // Edge to edge on notched phones; container-page and the footer keep
  // content inside the safe area.
  viewportFit: "cover",
};

/** What the command palette offers: every project, then the places to go. Slim, since every page carries it. */
const paletteEntries: PaletteEntry[] = [
  ...projects.map((p) => ({
    id: `p-${p.slug}`,
    group: "Projects" as const,
    label: p.title,
    hint: p.tagline,
    href: `/work/${p.slug}`,
    keywords: p.categories.join(" "),
    accent: p.accent,
    slug: p.slug,
  })),
  ...(
    [
      ["home", "Home", "The start", "/"],
      ["hello", "At a glance", "Who Himanshu is, on one screen", "/#hello"],
      ["experience", "Experience", "The Cleartrip role", "/#experience"],
      ["projects", "Projects", "Three flagships, then everything else", "/#work"],
      ["skills", "Skills", "The tools, and the work that shows them", "/#skills"],
      ["work", "All work", "Every project, with a filter", "/work"],
      ["lab", "Lab", "Interactive simulations of systems he has built", "/lab"],
      ["about", "About", "Experience, education and capabilities", "/about"],
      ["resume", "Résumé", "Ready to print", "/resume"],
      ["contact", "Contact", "Say hello", "/#contact"],
    ] as const
  ).map(([id, label, hint, href]) => ({ id: `g-${id}`, group: "Go to" as const, label, hint, href })),
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${caveat.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={motionInitScript} />
      </head>
      <body className="min-h-svh">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-fg-inverse px-4 py-2.5 text-sm font-medium text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <MotionPreferences>
          <SiteHeader name={profile.name} items={navigation} resume={resume} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter name={profile.name} />
          <RevealObserver />
          <PaletteHost entries={paletteEntries} email={profile.email} />
          <XRayHost />
          <Fx projects={projects.map((p) => ({ slug: p.slug, accent: p.accent }))} />
        </MotionPreferences>
      </body>
    </html>
  );
}
