"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import {
	IN_VIEW_AMOUNT,
	IN_VIEW_ROOT_MARGIN,
	useInView,
} from "./use-in-view-section";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Scroll-triggered section fade
 *
 * Trigger: section scrolls into/out of view (IntersectionObserver).
 *
 *    0ms   section not in view → opacity 0
 *  150ms   after in view → section fades in (opacity 1)
 *   —     when leaving view → section smoothly fades back to opacity 0
 *
 * Used to wrap each page section so they softly fade in when entering
 * the viewport and fade out when leaving, without any vertical offset.
 * ───────────────────────────────────────────────────────── */

const TIMING = {
	/** Delay in ms after section is in view before starting fade-in */
	sectionFadeIn: 150,
} as const;

/** Visual and spring config for the fade in/out (opacity only) */
const SECTION = {
	finalOpacity: 1,
	initialOpacity: 0,
	spring: {
		// Tuned for a slower, smoother fade
		damping: 32,
		stiffness: 180,
		type: "spring" as const,
	},
} as const;

interface FadeInSectionProps {
	children: ReactNode;
	/** Optional className on the motion wrapper */
	className?: string;
	/** Re-trigger animation when this value changes (e.g. for replay) */
	replayTrigger?: number;
}

function useFadeInSectionAnimation<T extends HTMLElement>(
	replayTrigger: number,
) {
	const { ref, isInView } = useInView<T>(IN_VIEW_AMOUNT, IN_VIEW_ROOT_MARGIN);
	const [stage, setStage] = useState(0);
	const prefersReducedMotion = useReducedMotion();

	useEffect(() => {
		// Include in effect body so dependency is meaningful when parents bump `replayTrigger` to replay.
		void replayTrigger;

		if (!isInView) {
			setStage(0);
			return;
		}
		if (prefersReducedMotion) {
			setStage(1);
			return;
		}
		setStage(0);
		const t = setTimeout(() => setStage(1), TIMING.sectionFadeIn);
		return () => clearTimeout(t);
	}, [isInView, replayTrigger, prefersReducedMotion]);

	const transition = prefersReducedMotion ? { duration: 0 } : SECTION.spring;

	const opacity = stage >= 1 ? SECTION.finalOpacity : SECTION.initialOpacity;

	return {
		opacity,
		ref,
		transition,
	};
}

type MotionSectionRest = Omit<
	HTMLMotionProps<"section">,
	"animate" | "children" | "initial" | "transition"
>;

type MotionFooterRest = Omit<
	HTMLMotionProps<"footer">,
	"animate" | "children" | "initial" | "transition"
>;

type MotionDivRest = Omit<
	HTMLMotionProps<"div">,
	"animate" | "children" | "initial" | "transition"
>;

/**
 * Wraps content in a motion.div that fades in when the section scrolls into view
 * and fades out when it leaves the viewport. Single stage driven by in-view + TIMING.sectionFadeIn.
 */
export function FadeInSection({
	children,
	className,
	replayTrigger = 0,
	...rest
}: FadeInSectionProps & MotionDivRest) {
	const { ref, opacity, transition } =
		useFadeInSectionAnimation<HTMLDivElement>(replayTrigger);

	return (
		<motion.div
			ref={ref}
			animate={{ opacity }}
			className={className}
			initial={{ opacity: SECTION.initialOpacity }}
			transition={transition}
			{...rest}
		>
			{children}
		</motion.div>
	);
}

/** Page section with the same scroll storyboard; keeps semantic `<section>` for layout and a11y. */
export function FadeSection({
	children,
	className,
	replayTrigger = 0,
	...rest
}: FadeInSectionProps & MotionSectionRest) {
	const { ref, opacity, transition } =
		useFadeInSectionAnimation<HTMLElement>(replayTrigger);

	return (
		<motion.section
			ref={ref}
			animate={{ opacity }}
			className={className}
			initial={{ opacity: SECTION.initialOpacity }}
			transition={transition}
			{...rest}
		>
			{children}
		</motion.section>
	);
}

/** Footer with the same scroll-linked fade as sections. */
export function FadeFooter({
	children,
	className,
	replayTrigger = 0,
	...rest
}: FadeInSectionProps & MotionFooterRest) {
	const { ref, opacity, transition } =
		useFadeInSectionAnimation<HTMLElement>(replayTrigger);

	return (
		<motion.footer
			ref={ref}
			animate={{ opacity }}
			className={className}
			initial={{ opacity: SECTION.initialOpacity }}
			transition={transition}
			{...rest}
		>
			{children}
		</motion.footer>
	);
}
