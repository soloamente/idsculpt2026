"use client";

import { FadeInSection } from "@/components/fade-section";
import type { ProjectFrame, ProjectImage } from "@/components/projects";
import { SkulletImage } from "@/components/skullet-image";
import { WorkFigure } from "@/components/work-figure";

/** Shared figure markup — was inline on the case page; lives here so each row can be wrapped by Motion. */
function ProjectFigure({
	image,
	kind,
	priority = false,
}: {
	image: ProjectImage;
	kind: "full" | "pair";
	priority?: boolean;
}) {
	return (
		<figure
			className={
				kind === "pair"
					? "project-frame project-frame--pair"
					: "project-frame project-frame--full"
			}
			style={{
				background: image.background,
				aspectRatio: image.aspect,
			}}
		>
			<WorkFigure
				label={image.alt ? `Loading ${image.alt}` : "Loading project image"}
				className="relative size-full"
			>
				<SkulletImage
					src={image.src}
					alt={image.alt}
					fill
					loading="eager"
					priority={priority}
					sizes={
						kind === "pair"
							? "(min-width: 993px) 472px, calc(50vw - 24px)"
							: "(min-width: 993px) 960px, calc(100vw - 32px)"
					}
					className={
						image.fit === "contain" ? "object-contain" : "object-cover"
					}
					style={{ objectPosition: image.position }}
				/>
			</WorkFigure>
		</figure>
	);
}

/**
 * Stacked media column — each `.project-line` uses idsculpt2026-style FadeInSection
 * (opacity spring + 150ms delay after intersect; fades out when leaving view).
 */
export function ProjectMediaSection({
	frames,
}: {
	frames: readonly ProjectFrame[];
}) {
	return (
		<div className="project-media">
			{frames.map((frame, frameIndex) => {
				const firstImagePriority = frameIndex === 0;

				switch (frame.kind) {
					case "full":
						return (
							<FadeInSection
								key={frame.image.src}
								className="project-line"
							>
								<ProjectFigure
									image={frame.image}
									kind="full"
									priority={firstImagePriority}
								/>
							</FadeInSection>
						);
					case "pair":
						return (
							<FadeInSection
								key={frame.images.map((image) => image.src).join("-")}
								className="project-line project-line--pair"
							>
								{frame.images.map((image, imageIndex) => (
									<ProjectFigure
										key={image.src}
										image={image}
										kind="pair"
										priority={firstImagePriority && imageIndex === 0}
									/>
								))}
							</FadeInSection>
						);
					default: {
						const _exhaustive: never = frame;
						return _exhaustive;
					}
				}
			})}
		</div>
	);
}
