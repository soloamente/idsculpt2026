"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

/** Spring tuned for a quick, confident hover — firmer than before so it doesn’t feel sluggish */
const HOVER_SPRING = {
	type: "spring" as const,
	stiffness: 220,
	damping: 26,
	mass: 1,
};

/** Gentle scale so motion reads as polish, not a “pop” */
const HOVER_SCALE = 1.014;

/**
 * Shared hover feedback for home rail cards, case-study review card, and similar tone blocks.
 * Scale-only spring — only when the device has real hover + fine pointer (no touch lift).
 */
export function HomeHoverSurface({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const reduce = useReducedMotion();
	const [hoverCapable, setHoverCapable] = useState(false);

	useEffect(() => {
		const media = window.matchMedia("(hover: hover) and (pointer: fine)");
		const sync = () => setHoverCapable(media.matches);
		sync();
		media.addEventListener("change", sync);
		return () => media.removeEventListener("change", sync);
	}, []);

	if (reduce || !hoverCapable) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			/* Promote to its own layer while scaling on hover — avoids muddy text/raster during the spring. */
			style={{ transformOrigin: "center center", willChange: "transform" }}
			initial={false}
			whileHover={{ scale: HOVER_SCALE }}
			transition={HOVER_SPRING}
		>
			{children}
		</motion.div>
	);
}
