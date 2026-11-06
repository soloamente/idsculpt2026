import { ProjectHeroSkullet } from "@/components/project-hero-skullet";
import type { Project } from "@/components/projects";

/** Top-of-page copy: small label, then the larger line. Both render uppercase. */
export function ProjectWordsSection({ project }: { project: Project }) {
	return (
		<div className="project-words">
			<ProjectHeroSkullet>
				<p className="project-words-summary">{project.summary}</p>
				<h1>{project.headline}</h1>
			</ProjectHeroSkullet>
		</div>
	);
}
