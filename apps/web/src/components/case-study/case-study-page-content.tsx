"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect } from "react";

import {
	CaseStudyEmailPill,
	CaseStudyPillLink,
} from "@/components/case-study/case-study-pill-link";
import { CaseStudyMediaStack } from "@/components/case-study/case-study-media-stack";
import { CaseStudySectionNav } from "@/components/case-study/case-study-section-nav";
import { FadeInSection } from "@/components/fade-section";
import type { CaseStudyDocument } from "@/data/case-studies";
import {
	getCaseStudy,
	getCaseStudyScrollChain,
	getNextCaseStudySlug,
} from "@/data/case-studies";
import type { CaseStudySlug } from "@/data/gallery-projects";
import { getGalleryProjectBySlug } from "@/data/gallery-projects";
import { CONTACT_EMAIL } from "@/lib/contact";

interface CaseStudyPageContentProps {
	study: CaseStudyDocument;
}

/**
 * Figma 937:377 — three 81×100 previews of the next project, one horizontal line.
 * Paint order is back → right → front so the left card sits on top.
 */
const NEXT_PROJECT_CARDS = [
	{ imageIndex: 1, rotate: 8.69, left: 74, width: 95, height: 111, z: 1 },
	{ imageIndex: 2, rotate: -8.57, left: 154, width: 95, height: 111, z: 2 },
	{ imageIndex: 0, rotate: -5.45, left: 0, width: 90, height: 107, z: 3 },
] as const;

/** Three different frames from the next case study: open, middle, close. */
function nextProjectPreviewSources(slug: CaseStudySlug): string[] {
	const unique = [
		...new Set(getCaseStudy(slug).sections.map((section) => section.src)),
	];
	if (unique.length === 0) return [];
	if (unique.length === 1) return [unique[0], unique[0], unique[0]];
	if (unique.length === 2) return [unique[0], unique[1], unique[0]];
	const middle = Math.floor(unique.length / 2);
	return [unique[0], unique[middle], unique[unique.length - 1]];
}

function CaseStudyNextProjectCluster({
	nextSlug,
}: {
	nextSlug: CaseStudySlug;
}) {
	const project = getGalleryProjectBySlug(nextSlug);
	const previewSources = nextProjectPreviewSources(nextSlug);
	if (!project?.slug || previewSources.length === 0) return null;

	const scrollTargetId = `case-study-${nextSlug}`;

	return (
		<div className="relative mx-auto h-[112px] w-[249px]">
			{NEXT_PROJECT_CARDS.map((card) => (
				<div
					key={`${nextSlug}-${card.left}`}
					className="absolute top-0 flex items-center justify-center"
					style={{
						left: card.left,
						width: card.width,
						height: card.height,
						zIndex: card.z,
					}}
				>
					<div style={{ transform: `rotate(${card.rotate}deg)` }}>
						<a
							href={`#${scrollTargetId}`}
							className="relative block h-[100px] w-[81px] overflow-hidden rounded-[15px] transition-transform duration-200 ease-out hover:scale-105 motion-reduce:transition-none"
							aria-label={`Scroll to ${project.title} case study`}
						>
							<Image
								src={previewSources[card.imageIndex] ?? previewSources[0]}
								alt=""
								fill
								className="object-cover object-center"
								sizes="81px"
								unoptimized={process.env.NODE_ENV === "development"}
							/>
						</a>
					</div>
				</div>
			))}
		</div>
	);
}

function CaseStudyIntro({
	study,
	anchorId,
}: {
	study: CaseStudyDocument;
	anchorId: string;
}) {
	return (
		<header
			id={anchorId}
			className="mx-auto flex w-full max-w-[829px] scroll-mt-24 flex-col items-center gap-2.5 py-[clamp(4rem,12vw,219px)] text-center uppercase"
		>
			<p className="w-full font-medium text-[#454545] text-base">{study.eyebrow}</p>
			<h1 className="w-full text-balance font-medium text-[#454545] text-[clamp(1.25rem,3.5vw,1.73rem)] leading-tight">
				{study.headline}
			</h1>
		</header>
	);
}

/** Hand-off between projects, or a quiet end when the scroll chain runs out. */
function CaseStudyHandOff({ study }: { study: CaseStudyDocument }) {
	const nextSlug = getNextCaseStudySlug(study.slug);

	if (nextSlug === null) {
		return (
			<FadeInSection className="flex flex-col items-center gap-5 px-6 py-6 text-center uppercase">
				<p className="font-medium text-base text-black">
					That&apos;s all for now
				</p>
				<CaseStudyPillLink href="/gallery">Back to all projects</CaseStudyPillLink>
				<p className="font-medium text-base text-black/50">or</p>
				<CaseStudyEmailPill email={CONTACT_EMAIL} />
			</FadeInSection>
		);
	}

	return (
		<FadeInSection className="flex flex-col items-center gap-5 px-6 py-6 text-center uppercase">
			<CaseStudyNextProjectCluster nextSlug={nextSlug} />
			<p className="font-medium text-base text-black">
				scroll to see the next project
			</p>
			<p className="font-medium text-base text-black/50">or</p>
			<CaseStudyEmailPill email={CONTACT_EMAIL} />
			<Link className="sr-only" href={`#case-study-${nextSlug}`}>
				Next case study: {nextSlug}
			</Link>
		</FadeInSection>
	);
}

function CaseStudyScrollBlock({ study }: { study: CaseStudyDocument }) {
	const anchorId = `case-study-${study.slug}`;

	return (
		<div className="mx-auto flex w-full max-w-[1384px] flex-col gap-[223px]">
			<CaseStudyIntro study={study} anchorId={anchorId} />
			<CaseStudyMediaStack sections={study.sections} />
			<CaseStudyHandOff study={study} />
		</div>
	);
}

/**
 * One continuous scroll: starting case study, then every following project in
 * `CASE_STUDY_SCROLL_ORDER` until there are none left.
 */
export function CaseStudyPageContent({ study }: CaseStudyPageContentProps) {
	const prefersReducedMotion = useReducedMotion();
	const scrollSlugs = getCaseStudyScrollChain(study.slug);
	const scrollStudies = scrollSlugs.map((slug) => getCaseStudy(slug));
	const sectionNavSections = scrollStudies.flatMap((doc) => doc.sections);
	// Gallery → case study should open at the intro title, not mid-scroll from the previous page.
	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
	}, [study.slug]);

	const pageEnter = prefersReducedMotion
		? { opacity: 1, y: 0 }
		: { opacity: 0, y: 8 };
	const pageAnimate = { opacity: 1, y: 0 };
	const pageTransition = prefersReducedMotion
		? { duration: 0 }
		: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

	return (
		<motion.main
			animate={pageAnimate}
			className="relative min-h-screen bg-[#f9f9f9] pb-[calc(139px+5rem)]"
			data-header-text="dark"
			initial={pageEnter}
			transition={pageTransition}
		>
			<div className="relative flex w-full flex-col items-center gap-[206px] px-[18px] pt-40 md:px-7">
				<CaseStudyPillLink
					className="absolute left-[18px] top-[37px] z-20 md:left-7"
					href="/gallery"
				>
					Return to projects
				</CaseStudyPillLink>

				{scrollStudies.map((doc) => (
					<CaseStudyScrollBlock key={doc.slug} study={doc} />
				))}
			</div>

			<CaseStudySectionNav sections={sectionNavSections} />
		</motion.main>
	);
}
