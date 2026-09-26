import { getProject, projects } from "@/content/projects";
import { ogImage, ogSize, ogType } from "@/lib/og";

export const size = ogSize;
export const contentType = ogType;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  return [{ id: "card", size: ogSize, contentType: ogType, alt: project ? `${project.title}: ${project.tagline}` : "" }];
}

/** The project's link preview: its title and tagline in its accent, and its own figures. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) return new Response(null, { status: 404 });
  return ogImage({
    accent: project.accent,
    eyebrow: project.categories.join(" · "),
    title: project.title,
    line: project.tagline,
    metrics: project.metrics,
  });
}
