"use client";

import { cn } from "@idsculpt/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { FadeInSection } from "@/components/fade-section";

export interface GalleryProject {
	/** Una o più immagini del progetto; i quadrati sotto la card = conteggio preview. */
	images: string[];
	alt: string;
	title: string;
	type: string;
	/** When true, project appears under the Case studies filter. */
	isCaseStudy?: boolean;
}

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Gallery image step (shared axis)
 *
 * Trigger: user selects a preview square (forward or backward).
 * Parallel tracks — outgoing and incoming run together for a crossfade slide.
 *
 * Forward (next image):
 *    0ms   outgoing at center (opacity 1, x 0)
 *    0ms   incoming off-axis right (+offsetPx), opacity 0
 *  ~340ms incoming glides to center, opacity 1 (soft spring, no bounce)
 *  ~280ms outgoing glides left (-offsetPx), opacity 0
 *
 * Backward: axis reversed. Scale omitted — object-contain images jitter on scale.
 * All project images preload on mount so swaps never flash on first visit.
 * ───────────────────────────────────────────────────────── */

const TIMING = {
	/** Incoming preview settle time (ms) — soft spring, zero bounce. */
	stepEnter: 340,
	/** Outgoing preview exit time (ms) — slightly snappier than enter. */
	stepExit: 280,
} as const;

/** Shared-axis preview slide — visual + spring values only; no magic numbers in JSX. */
const STEP = {
	offsetPx: 20,
	enterSpring: {
		bounce: 0,
		damping: 38,
		stiffness: 260,
		type: "spring" as const,
		visualDuration: TIMING.stepEnter / 1000,
	},
	exitSpring: {
		bounce: 0,
		damping: 40,
		stiffness: 300,
		type: "spring" as const,
		visualDuration: TIMING.stepExit / 1000,
	},
	/** Opacity crossfades on a gentle curve so the overlap reads as one continuous move. */
	opacityEase: [0.22, 1, 0.36, 1] as const,
	opacityEnterDuration: TIMING.stepEnter / 1000,
	opacityExitDuration: TIMING.stepExit / 1000,
} as const;

/** Preview square indicator chip — mirrors gallery-view-toggle feel. */
const INDICATOR = {
	spring: {
		bounce: 0,
		damping: 34,
		stiffness: 380,
		type: "spring" as const,
	},
} as const;

type StepDirection = 1 | -1;

/** Per-property transitions: x on spring, opacity on ease — avoids harsh fade pops. */
const stepCenterTransition = {
	opacity: {
		duration: STEP.opacityEnterDuration,
		ease: STEP.opacityEase,
	},
	x: STEP.enterSpring,
};

const stepExitTransition = {
	opacity: {
		duration: STEP.opacityExitDuration,
		ease: STEP.opacityEase,
	},
	x: STEP.exitSpring,
};

/** Directional enter / center / exit variants for AnimatePresence. */
const galleryStepVariants = {
	center: {
		opacity: 1,
		x: 0,
		zIndex: 2,
		transition: stepCenterTransition,
	},
	enter: (direction: StepDirection) => ({
		opacity: 0,
		x: direction * STEP.offsetPx,
		zIndex: 2,
	}),
	exit: (direction: StepDirection) => ({
		opacity: 0,
		x: direction * -STEP.offsetPx,
		zIndex: 1,
		transition: stepExitTransition,
	}),
};

/** Instant swap when the user prefers reduced motion. */
const galleryStepReducedMotionVariants = {
	center: { opacity: 1, x: 0, zIndex: 2 },
	enter: { opacity: 1, x: 0, zIndex: 2 },
	exit: { opacity: 1, x: 0, transition: { duration: 0 }, zIndex: 1 },
};

/** Warm the browser cache so step changes never wait on first paint. */
function usePreloadGalleryImages(sources: string[]) {
	useEffect(() => {
		const preloaders = sources.map((src) => {
			const img = new window.Image();
			img.src = src;
			return img;
		});
		return () => {
			for (const img of preloaders) {
				img.src = "";
			}
		};
	}, [sources]);
}

/**
 * Card progetto gallery: preview con paginazione a quadrati (una tacca per immagine).
 */
export function GalleryProjectCard({ project }: { project: GalleryProject }) {
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	// +1 = avanti (entra da destra), -1 = indietro (entra da sinistra).
	const [slideDirection, setSlideDirection] = useState<StepDirection>(1);
	const prefersReducedMotion = useReducedMotion();
	const activeImage = project.images[activeImageIndex] ?? project.images[0];
	const indicatorLayoutId = `gallery-step-dot-${project.title}`;

	usePreloadGalleryImages(project.images);

	const handleImageSelect = (nextIndex: number) => {
		if (nextIndex === activeImageIndex) return;
		setSlideDirection(nextIndex > activeImageIndex ? 1 : -1);
		setActiveImageIndex(nextIndex);
	};

	const stepVariants = prefersReducedMotion
		? galleryStepReducedMotionVariants
		: galleryStepVariants;
	const indicatorTransition = prefersReducedMotion
		? { duration: 0 }
		: INDICATOR.spring;

	return (
		<FadeInSection className="h-full">
			{/*
			 * Square card shell: image flexes in the upper area; dots + title stay
			 * inside without stretching the outer aspect ratio.
			 */}
			<article className="flex aspect-square w-full min-w-0 max-w-full flex-col items-center gap-3 overflow-hidden rounded-[10px] bg-[#f8f7f7] px-[30px] py-[30px]">
				<div className="relative min-h-0 w-full flex-1 overflow-hidden">
					<AnimatePresence custom={slideDirection} initial={false} mode="sync">
						<motion.div
							key={activeImageIndex}
							custom={slideDirection}
							className="absolute inset-0"
							variants={stepVariants}
							initial="enter"
							animate="center"
							exit="exit"
						>
							{/*
							 * `unoptimized`: local PNGs in public/ are swapped often during design.
							 * next/image caches by URL in `.next/cache/images`, so same-filename
							 * replacements otherwise keep showing the old optimized file.
							 */}
							<Image
								src={activeImage}
								alt={`${project.alt} preview ${activeImageIndex + 1}`}
								fill
								className="object-contain object-center"
								sizes="(max-width: 768px) 100vw, 50vw"
								unoptimized={process.env.NODE_ENV === "development"}
							/>
						</motion.div>
					</AnimatePresence>
				</div>

				<div className="flex w-full shrink-0 flex-col items-center gap-3">
					{/* Quadrati = quante immagini si possono scorrere per questo progetto. */}
					<div
						className="flex items-center gap-4"
						role="tablist"
						aria-label={`${project.title} image previews`}
					>
						{project.images.map((imageSrc, index) => {
							const isActive = index === activeImageIndex;
							return (
								<button
									key={`${imageSrc}-${index}`}
									type="button"
									role="tab"
									aria-selected={isActive}
									aria-label={`Show image ${index + 1} of ${project.images.length}`}
									className={cn(
										"relative size-2 shrink-0 [-webkit-tap-highlight-color:transparent]",
										!isActive && "bg-[#202020]/30",
									)}
									onClick={() => handleImageSelect(index)}
								>
									{/* Shared chip slides between squares so direction matches the preview. */}
									{isActive ? (
										<motion.span
											layoutId={indicatorLayoutId}
											aria-hidden
											className="absolute inset-0 bg-[#202020]"
											transition={indicatorTransition}
										/>
									) : null}
								</button>
							);
						})}
					</div>

					<div className="text-center uppercase">
						<h3 className="font-medium opacity-50">{project.title}</h3>
						<p className="text-xs opacity-25">{project.type}</p>
					</div>
				</div>
			</article>
		</FadeInSection>
	);
}
