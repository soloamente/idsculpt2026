"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

import { FadeSection } from "@/components/fade-section";
import {
	GalleryProjectCard,
	type GalleryProject,
} from "@/components/gallery-project-card";
import {
	GalleryViewToggle,
	getGalleryViewIntro,
	type GalleryViewMode,
} from "@/components/gallery-view-toggle";

/** Accoppia i progetti filtrati per righe a 2 colonne. */
function chunkGalleryRows(
	projects: GalleryProject[],
	rowSize: number,
): GalleryProject[][] {
	const rows: GalleryProject[][] = [];
	for (let index = 0; index < projects.length; index += rowSize) {
		rows.push(projects.slice(index, index + rowSize));
	}
	return rows;
}

function filterProjectsByView(
	projects: GalleryProject[],
	mode: GalleryViewMode,
): GalleryProject[] {
	if (mode === "all-work") {
		return projects;
	}
	return projects.filter((project) => project.isCaseStudy);
}

interface GalleryPageContentProps {
	projects: GalleryProject[];
}

/**
 * Client shell: view toggle, filtered grid, and intro copy.
 * Hero + grid are siblings so card scroll-fades stay independent of the intro band.
 */
export function GalleryPageContent({ projects }: GalleryPageContentProps) {
	const [viewMode, setViewMode] = useState<GalleryViewMode>("all-work");
	const prefersReducedMotion = useReducedMotion();

	const caseStudyCount = useMemo(
		() => projects.filter((project) => project.isCaseStudy).length,
		[projects],
	);
	const hasCaseStudies = caseStudyCount > 0;

	const filteredProjects = useMemo(
		() => filterProjectsByView(projects, viewMode),
		[projects, viewMode],
	);
	const galleryRows = chunkGalleryRows(filteredProjects, 2);
	const introCopy = getGalleryViewIntro(viewMode, hasCaseStudies);

	const contentTransition = prefersReducedMotion
		? { duration: 0 }
		: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

	return (
		<>
			<FadeSection
				className="relative flex w-full flex-col items-center gap-16 px-[18px] pt-40 pb-16 uppercase md:gap-[90px]"
				data-header-text="dark"
				id="gallery-intro"
			>
				<div className="flex max-w-[829px] flex-col items-center gap-[15px] text-center">
					<p className="text-base text-black/50">portfolio</p>
					<h1 className="font-medium text-[#202020] text-[clamp(1.5rem,4vw,2rem)] leading-normal">
						<span className="block">Our offerings,</span>
						<span className="block">a canvas of creativity.</span>
					</h1>
				</div>

				<div className="flex w-full max-w-4xl flex-col items-center gap-6">
					<GalleryViewToggle
						caseStudiesAvailable={hasCaseStudies}
						value={viewMode}
						onChange={setViewMode}
					/>

					<div className="flex w-full items-center justify-center gap-9">
						<span aria-hidden className="size-2 shrink-0 bg-[#202020]" />
						<AnimatePresence initial={false} mode="wait">
							<motion.p
								key={viewMode}
								animate={{ opacity: 1, y: 0 }}
								className="max-w-[462px] text-center font-light text-[clamp(1rem,1.8vw,1.44rem)] normal-case leading-normal"
								exit={{ opacity: 0, y: -6 }}
								initial={{ opacity: 0, y: 6 }}
								transition={contentTransition}
							>
								{introCopy}
							</motion.p>
						</AnimatePresence>
						<span aria-hidden className="size-2 shrink-0 bg-[#202020]" />
					</div>
				</div>
			</FadeSection>

			<section
				className="relative flex w-full flex-col gap-[10px] px-[18px] pb-24"
				data-header-text="dark"
				id="gallery-grid"
			>
				<AnimatePresence initial={false} mode="wait">
					<motion.div
						key={viewMode}
						animate={{ opacity: 1 }}
						className="flex w-full flex-col gap-[10px]"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						transition={contentTransition}
					>
						{galleryRows.length > 0 ? (
							galleryRows.map((row, rowIndex) => (
								<div
									key={`gallery-row-${viewMode}-${rowIndex}`}
									className="grid min-w-0 grid-cols-1 gap-[10px] md:grid-cols-2"
								>
									{row.map((project) => (
										<GalleryProjectCard
											key={`${project.title}-${project.images[0]}`}
											project={project}
										/>
									))}
								</div>
							))
						) : (
							<p className="py-24 text-center font-light text-[#202020]/50 normal-case">
								No case studies yet — check back soon.
							</p>
						)}
					</motion.div>
				</AnimatePresence>
			</section>
		</>
	);
}
