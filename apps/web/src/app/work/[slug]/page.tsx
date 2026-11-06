import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { ProjectCloseSection } from "@/components/project-close-section";
import { ProjectMediaSection } from "@/components/project-media-section";
import { ProjectNextDock } from "@/components/project-next-dock";
import { ProjectPageReview } from "@/components/project-page-review";
import { ProjectWordsSection } from "@/components/project-words-section";
import { RevealSection } from "@/components/reveal-section";
import {
	getProject,
	PROJECTS,
	type ProjectSlug,
} from "@/components/projects";
import { getReviewForProject } from "@/lib/project-review";

interface ProjectPageProps {
	params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
	return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
	params,
}: ProjectPageProps): Promise<Metadata> {
	const { slug } = await params;
	const project = getProject(slug);
	if (!project) return { title: "Work — idsculpt26" };
	return {
		title: `${project.title} — idsculpt26`,
		description: project.lede,
	};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
	const { slug } = await params;
	const project = getProject(slug);
	if (!project) notFound();

	const projectReview = getReviewForProject(project);

	return (
		<PageShell>
			{/* Case order: words → stacked media lines → close (no full-bleed cover). */}
			<main className="project-page">
				<RevealSection className="project-reveal-rail min-w-0">
					<ProjectWordsSection project={project} />
				</RevealSection>

				{/* Gallery: each row has its own FadeInSection — no outer RevealSection (would double y-motion). */}
				<div className="project-reveal-rail min-w-0">
					<ProjectMediaSection frames={project.frames} />
				</div>

				{projectReview ? (
					<RevealSection className="project-reveal-rail min-w-0">
						<ProjectPageReview review={projectReview} />
					</RevealSection>
				) : null}

				<RevealSection className="project-reveal-rail min-w-0">
					<ProjectCloseSection
						className="project-close--with-next-dock"
						heading={<h2>Start a similar project.</h2>}
					/>
				</RevealSection>
				<ProjectNextDock currentSlug={project.slug as ProjectSlug} />
			</main>
		</PageShell>
	);
}
