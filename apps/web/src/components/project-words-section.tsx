import { ProjectHeroSkullet } from "@/components/project-hero-skullet";
import type { Project } from "@/components/projects";

/** Top-of-page copy: centered headline and one muted line. */
export function ProjectWordsSection({ project }: { project: Project }) {
	return (
		<div className="project-words">
			<ProjectHeroSkullet>
				<h1>{project.headline}</h1>
				<p className="project-words-summary">{project.summary}</p>
			</ProjectHeroSkullet>
		</div>
	);
}
