import Link from "next/link";

import { HomeProjectCopySkullet } from "@/components/home-work-copy-skullet";
import {
	PROJECTS,
	type Project,
	type ProjectFrame,
	type ProjectImage,
	WORK_PROJECT_PATHS,
} from "@/components/projects";
import { SkulletImage } from "@/components/skullet-image";
import { WorkFigure } from "@/components/work-figure";

/** First pair frame on the case study, when we have one for the home previews. */
function getPairFrame(
	frames: readonly ProjectFrame[],
): ProjectFrame | undefined {
	return frames.find((frame) => frame.kind === "pair");
}

function PreviewImage({
	image,
	kind,
	label,
}: {
	image: ProjectImage;
	kind: "hero" | "pair";
	label: string;
}) {
	return (
		<WorkFigure label={label} className="relative size-full">
			<SkulletImage
				src={image.src}
				alt={image.alt}
				fill
				loading="eager"
				sizes={
					kind === "hero"
						? "(min-width: 760px) calc(100vw - 80px), calc(100vw - 32px)"
						: "(min-width: 760px) calc((100vw - 96px) / 2), calc(100vw - 32px)"
				}
				className={image.fit === "contain" ? "object-contain" : "object-cover"}
				style={{ objectPosition: image.position }}
				draggable={false}
			/>
		</WorkFigure>
	);
}

function HomeProjectBlock({ project }: { project: Project }) {
	const pair = getPairFrame(project.frames);
	const href = WORK_PROJECT_PATHS[project.slug];

	return (
		<article className="home-project">
			<div className="home-project-previews">
				<Link
					href={href}
					transitionTypes={["page-push"]}
					aria-label={`View ${project.title}`}
					className="home-project-hero-link"
				>
					<div
						className="home-project-hero-frame"
						style={{ background: project.hero.background ?? "#f4f4f4" }}
					>
						<PreviewImage
							image={project.hero}
							kind="hero"
							label={`Loading ${project.title}`}
						/>
					</div>
				</Link>
				{pair?.kind === "pair" ? (
					<div className="home-project-pair">
						{pair.images.map((image) => (
							<Link
								key={image.src}
								href={href}
								transitionTypes={["page-push"]}
								aria-label={`View ${project.title}`}
								className="home-project-pair-link"
							>
								<div
									className="home-project-pair-frame"
									style={{ background: image.background ?? "#f4f4f4" }}
								>
									<PreviewImage
										image={image}
										kind="pair"
										label={`Loading ${project.title}`}
									/>
								</div>
							</Link>
						))}
					</div>
				) : null}
			</div>
			<HomeProjectCopySkullet label={`Loading ${project.title} description`}>
				<h2 className="home-project-title">
					<Link href={href} transitionTypes={["page-push"]}>
						{project.title}
					</Link>
				</h2>
				<p className="home-project-lede">{project.lede}</p>
			</HomeProjectCopySkullet>
		</article>
	);
}

/**
 * Case-study index under the carousel — Aesso-style preview stacks plus a
 * Permanent-style vertical list of the three studio pieces.
 */
export function HomeWorkIndex() {
	return (
		<section aria-label="Projects" className="home-work-index">
			<ul className="home-work-index-list">
				{PROJECTS.map((project) => (
					<li key={project.slug} className="home-work-index-item">
						<HomeProjectBlock project={project} />
					</li>
				))}
			</ul>
		</section>
	);
}
