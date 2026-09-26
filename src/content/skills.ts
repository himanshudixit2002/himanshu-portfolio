import { cleartrip } from "./experience";
import { projects } from "./projects";

/*
 * The skills on the résumé, grouped as it groups them. Each is tied to the
 * work that shows it: the projects whose own listed stack names it (or a
 * framework in that language — FastAPI is Python, Flutter is Dart), and the
 * Cleartrip role's stack. A skill with no such evidence is still listed,
 * with none shown. Nothing here is a new claim.
 */

type Skill = { name: string; match?: RegExp };

export const SKILL_GROUPS: { group: string; skills: Skill[] }[] = [
  {
    group: "Languages",
    skills: [
      { name: "Java", match: /\bJava\b(?!Script)|Spring Boot/ },
      { name: "Python", match: /Python|FastAPI|Flask|PyTorch|scikit-learn|Streamlit|OpenCV|TensorFlow/ },
      { name: "TypeScript", match: /TypeScript/ },
      { name: "JavaScript", match: /TypeScript|React|Next\.js|Express/ },
      { name: "SQL", match: /PostgreSQL|SQLite/ },
      { name: "Dart", match: /Flutter/ },
      { name: "C++", match: /C\+\+/ },
      { name: "Go", match: /^Go$/ },
      { name: "Swift", match: /Swift/ },
    ],
  },
  {
    group: "Product",
    skills: [
      { name: "React", match: /React/ },
      { name: "Next.js", match: /Next\.js/ },
      { name: "Tailwind CSS", match: /Tailwind/ },
      { name: "Flutter", match: /Flutter/ },
      { name: "SwiftUI", match: /SwiftUI/ },
      { name: "accessible and responsive UI" },
      { name: "web performance" },
    ],
  },
  {
    group: "Backend & data",
    skills: [
      { name: "Spring Boot", match: /Spring Boot/ },
      { name: "FastAPI", match: /FastAPI/ },
      { name: "Express", match: /Express/ },
      { name: "Kafka", match: /Kafka/ },
      { name: "Flink", match: /Flink/ },
      { name: "Redis", match: /Redis/ },
      { name: "Elasticsearch", match: /Elasticsearch/ },
      { name: "PostgreSQL", match: /PostgreSQL/ },
      { name: "Firestore", match: /Firestore/ },
      { name: "SQLite", match: /SQLite/ },
    ],
  },
  {
    group: "AI",
    skills: [
      { name: "LangGraph", match: /LangGraph/ },
      { name: "tool-calling agents" },
      { name: "LLM evaluation and guardrails" },
      { name: "Model Context Protocol" },
      { name: "scikit-learn", match: /scikit-learn/ },
      { name: "Keras", match: /Keras/ },
    ],
  },
  {
    group: "Delivery",
    skills: [
      { name: "Docker", match: /Docker/ },
      { name: "GitHub Actions", match: /GitHub Actions/ },
      { name: "OpenTelemetry", match: /OpenTelemetry/ },
      { name: "Prometheus", match: /Prometheus/ },
      { name: "Vitest", match: /Vitest/ },
      { name: "Playwright", match: /Playwright/ },
      { name: "Vercel", match: /Vercel/ },
      { name: "GCP Cloud Run" },
      { name: "AWS" },
    ],
  },
];

export type SkillEvidence = { name: string; projects: string[]; cleartrip: boolean };

/** Every skill with the work that shows it, as plain data for the client. */
export function skillEvidence(): { group: string; skills: SkillEvidence[] }[] {
  return SKILL_GROUPS.map(({ group, skills }) => ({
    group,
    skills: skills.map(({ name, match }) => ({
      name,
      projects: match ? projects.filter((p) => p.stack.some((t) => t.split(" · ").some((part) => match.test(part)))).map((p) => p.slug) : [],
      cleartrip: match ? cleartrip.stack.some((t) => match.test(t)) : false,
    })),
  }));
}
