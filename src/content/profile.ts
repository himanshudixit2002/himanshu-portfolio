import type { NavItem, Profile } from "./types";

export const profile: Profile = {
  name: "Himanshu Dixit",
  role: "Software engineer",
  location: "Bengaluru, India",
  headline: ["Engineered to", "feel effortless."],
  intro: "I build full-stack products, intelligent tools, and the systems behind them.",
  bio: [
    "I'm a software engineer in Bengaluru. My work spans the interface people touch, the services underneath it, and the data and tests that keep it honest.",
    "At Cleartrip I worked on hotel and flight booking — geospatial search, caching and regression automation. Alongside it I've shipped products for a menswear label and a snooker club, a multi-tenant inventory platform with an AI assistant, and systems projects built to understand how things fail.",
    "I studied Computer Science and Engineering at VIT, specialising in data science.",
  ],
  email: "himanshudixit2406@gmail.com",
  links: {
    github: { label: "GitHub", href: "https://github.com/himanshudixit2002" },
    linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/himanshudixit2406/" },
  },
};

/**
 * Site navigation. Homepage sections are addressed as /#id so the links also
 * work from other pages.
 */
export const navigation: NavItem[] = [
  { label: "Work", href: "/work", status: "live" },
  { label: "Lab", href: "/lab", status: "live" },
  { label: "About", href: "/about", status: "live" },
  { label: "Contact", href: "/#contact", status: "live" },
];

export const resume: NavItem = { label: "Résumé", href: "/resume", status: "live" };
