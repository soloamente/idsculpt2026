"use client";

import { cn } from "@idsculpt/ui/lib/utils";
import { motion, useReducedMotion } from "motion/react";

export type GalleryViewMode = "all-work" | "case-studies";

const galleryViewOptions: { id: GalleryViewMode; label: string }[] = [
	{ id: "all-work", label: "all work" },
	{ id: "case-studies", label: "case studies" },
];

interface GalleryViewToggleProps {
	value: GalleryViewMode;
	onChange: (mode: GalleryViewMode) => void;
	/** When false, the Case studies tab is disabled until content is tagged. */
	caseStudiesAvailable?: boolean;
}

/**
 * Pill All work / Case studies: shared chip slides between options via layoutId.
 */
export function GalleryViewToggle({
	value,
	onChange,
	caseStudiesAvailable = false,
}: GalleryViewToggleProps) {
	const prefersReducedMotion = useReducedMotion();

	const chipTransition = prefersReducedMotion
		? { duration: 0 }
		: { bounce: 0, damping: 34, stiffness: 420, type: "spring" as const };

	return (
		<div
			className="inline-flex items-center rounded-[32px] border border-black/10 p-1 backdrop-blur-[2px]"
			role="tablist"
			aria-label="Filter portfolio work"
		>
			{galleryViewOptions.map((option) => {
				const isActive = value === option.id;
				const isDisabled =
					option.id === "case-studies" && !caseStudiesAvailable;

				return (
					<button
						key={option.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						disabled={isDisabled}
						aria-disabled={isDisabled}
						className={cn(
							"relative inline-flex items-center rounded-[40px] px-5 py-2.5 text-sm uppercase transition-colors duration-200 ease-out [-webkit-tap-highlight-color:transparent]",
							isActive ? "font-bold text-white" : "font-normal text-[#202020]",
							isDisabled && "cursor-not-allowed opacity-40",
						)}
						onClick={() => {
							if (isDisabled) return;
							onChange(option.id);
						}}
					>
						{/* Un solo chip condiviso: motion lo anima da tab a tab. */}
						{isActive ? (
							<motion.span
								layoutId="gallery-view-toggle-chip"
								className="absolute inset-0 rounded-[40px] bg-[#202020]"
								transition={chipTransition}
								aria-hidden
							/>
						) : null}
						<span className="relative z-10 inline-flex items-center gap-1">
							{isActive ? (
								<span aria-hidden className="size-2 shrink-0 bg-current" />
							) : null}
							{option.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}

/** Short intro line shown under the filter pill for each view mode. */
export function getGalleryViewIntro(
	mode: GalleryViewMode,
	hasCaseStudies: boolean,
): string {
	switch (mode) {
		case "all-work":
			return "Every identity, interface, and mark we've shaped — browse the full portfolio.";
		case "case-studies":
			return hasCaseStudies
				? "Selected projects with process, systems, and deliverables — the stories behind the work."
				: "Case studies are coming soon — deep-dive project stories will live here.";
		default: {
			const _exhaustive: never = mode;
			return _exhaustive;
		}
	}
}
