import type { Metadata, Viewport } from "next";
import { Caveat, Inter, JetBrains_Mono } from "next/font/google";
import { navigation, profile, resume } from "@/content/profile";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { InlineScript } from "@/components/motion/InlineScript";
import { MotionPreferences } from "@/components/motion/MotionPreferences";
import { RevealObserver } from "@/components/motion/RevealObserver";
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
        </MotionPreferences>
      </body>
    </html>
  );
}
