import { profile } from "@/content/profile";
import { ogImage, ogSize, ogType } from "@/lib/og";

export const size = ogSize;
export const contentType = ogType;
export const alt = `${profile.name}, ${profile.role.toLowerCase()}: ${profile.headline.join(" ")}`;

/** The site's link preview: the homepage's own headline and introduction. */
export default function Image() {
  return ogImage({
    accent: "#5ca4ff",
    eyebrow: `${profile.role} · ${profile.location}`,
    title: profile.headline,
    line: profile.intro,
  });
}
