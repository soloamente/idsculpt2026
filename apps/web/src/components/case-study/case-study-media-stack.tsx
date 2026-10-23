"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { caseStudySectionAnchorProps } from "@/components/case-study/case-study-section-nav";
import { FadeInSection } from "@/components/fade-section";
import type { CaseStudySection } from "@/data/case-studies";

interface CaseStudyMediaStackProps {
	sections: CaseStudySection[];
}

/** Gradual opacity falloff by distance — avoids harsh 0.77 / 0.4 steps while hovering. */
function opacityForSection(index: number, activeIndex: number): number {
	if (index === activeIndex) {
		return 1;
	}
	const distance = Math.abs(index - activeIndex);
	return Math.max(0.72, 1 - distance * 0.1);
}

/** Read scale tokens from :root (duration/ease live in CSS — same as .t-improved-column). */
function readMediaHoverTokens() {
	const cs = getComputedStyle(document.documentElement);
	const num = (name: string, fallback: number) => {
		const value = Number.parseFloat(cs.getPropertyValue(name));
		return Number.isFinite(value) ? value : fallback;
	};

	return {
		expandScale: num("--case-study-media-scale-hover", 1.02),
		shrinkScale: num("--case-study-media-scale-shrink", 0.985),
	};
}

/**
 * Vertical stack of case-study frames — hovered block scales up, siblings shrink
 * with the same 850ms card-resize easing as homepage improved identities.
 */
export function CaseStudyMediaStack({ sections }: CaseStudyMediaStackProps) {
	const groupRef = useRef<HTMLDivElement>(null);
	const [hoverCapable, setHoverCapable] = useState(false);

	useEffect(() => {
		const media = window.matchMedia("(hover: hover) and (pointer: fine)");
		const sync = () => setHoverCapable(media.matches);
		sync();
		media.addEventListener("change", sync);
		return () => media.removeEventListener("change", sync);
	}, []);

	const applyHoverFocus = useCallback(
		(activeIndex: number | null) => {
			if (!hoverCapable || !groupRef.current) return;

			const nodes = groupRef.current.querySelectorAll<HTMLElement>(
				".t-case-study-media",
			);
			const { expandScale, shrinkScale } = readMediaHoverTokens();

			nodes.forEach((node, index) => {
				if (activeIndex === null) {
					node.style.removeProperty("--scale-active");
					node.style.removeProperty("--opacity-active");
					node.style.zIndex = "1";
					return;
				}

				const scale =
					index === activeIndex ? expandScale : shrinkScale;
				node.style.setProperty("--scale-active", String(scale));
				node.style.setProperty(
					"--opacity-active",
					String(opacityForSection(index, activeIndex)),
				);
				node.style.zIndex = index === activeIndex ? "2" : "1";
			});
		},
		[hoverCapable],
	);

	const handleGroupLeave = () => {
		applyHoverFocus(null);
	};

	return (
		<div
			ref={groupRef}
			className="t-case-study-media-group flex w-full flex-col gap-2.5"
			onMouseLeave={handleGroupLeave}
		>
			{sections.map((section, index) => (
				<FadeInSection key={section.id}>
					<div
						className="t-case-study-media relative w-full"
						onMouseEnter={() => applyHoverFocus(index)}
					>
						<div
							{...caseStudySectionAnchorProps(section)}
							className="relative w-full overflow-hidden rounded-3xl bg-[#f8f7f7]"
						>
							<Image
								src={section.src}
								alt={section.alt}
								width={1384}
								height={887}
								className="h-auto w-full object-cover object-center"
								sizes="(max-width: 768px) 100vw, 1384px"
								priority={index === 0}
								unoptimized={process.env.NODE_ENV === "development"}
							/>
						</div>
					</div>
				</FadeInSection>
			))}
		</div>
	);
}
