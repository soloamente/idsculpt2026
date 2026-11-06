"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Scroll-reveal wrapper (site-wide pattern from idsculpt2026). Uses Motion’s in-view
 * so content eases up once when it enters the viewport — respects reduced motion.
 */
export function RevealSection({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const reduce = useReducedMotion();

	if (reduce) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			style={{ willChange: "transform, opacity" }}
			initial={{ opacity: 0, y: 28 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
			transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
		>
			{children}
		</motion.div>
	);
}
