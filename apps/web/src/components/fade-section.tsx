"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";

import {
	IN_VIEW_AMOUNT,
	IN_VIEW_ROOT_MARGIN,
	useInView,
} from "@/components/use-in-view-section";

/*
 * Scroll-triggered section fade (idsculpt2026 parity):
 * - Out of view → opacity 0
 * - In view → after 150ms → opacity 1 (spring)
 * - Leave view → fade back to 0
 * No vertical offset — opacity only.
 */

const TIMING = {
	/** Delay in ms after section is in view before starting fade-in */
	sectionFadeIn: 150,
} as const;

const SECTION = {
	finalOpacity: 1,
	initialOpacity: 0,
	spring: {
		damping: 32,
		stiffness: 180,
		type: "spring" as const,
	},
} as const;

interface FadeInSectionProps {
	children: ReactNode;
	className?: string;
	/** Re-trigger animation when this value changes (e.g. for replay) */
	replayTrigger?: number;
}

function useFadeInSectionAnimation<T extends HTMLElement>(replayTrigger: number) {
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

type MotionDivRest = Omit<
	ComponentProps<typeof motion.div>,
	"animate" | "children" | "initial" | "transition"
>;

type MotionSectionRest = Omit<
	ComponentProps<typeof motion.section>,
	"animate" | "children" | "initial" | "transition"
>;

type MotionFooterRest = Omit<
	ComponentProps<typeof motion.footer>,
	"animate" | "children" | "initial" | "transition"
>;

/**
 * Wraps content in a motion.div that fades in when the section scrolls into view
 * and fades out when it leaves the viewport.
 */
export function FadeInSection({
	children,
	className,
	replayTrigger = 0,
	style,
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
			style={{ willChange: "opacity", ...style }}
			{...rest}
		>
			{children}
		</motion.div>
	);
}

/** Semantic section variant — same scroll storyboard as FadeInSection. */
export function FadeSection({
	children,
	className,
	replayTrigger = 0,
	style,
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
			style={{ willChange: "opacity", ...style }}
			{...rest}
		>
			{children}
		</motion.section>
	);
}

/** Footer variant — same scroll-linked fade as sections. */
export function FadeFooter({
	children,
	className,
	replayTrigger = 0,
	style,
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
			style={{ willChange: "opacity", ...style }}
			{...rest}
		>
			{children}
		</motion.footer>
	);
}
