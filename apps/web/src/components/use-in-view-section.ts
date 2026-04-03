"use client";

import { useEffect, useRef, useState } from "react";

/** Amount of section that must be visible (0–1) to trigger in view */
export const IN_VIEW_AMOUNT = 0.15;
/** Root margin so the animation starts just before section is fully in view */
export const IN_VIEW_ROOT_MARGIN = "-40px 0px -40px 0px";

/**
 * Tracks whether the observed element intersects the viewport (IntersectionObserver).
 * Used by scroll-driven section fades.
 */
export function useInView<T extends HTMLElement>(
	amount: number,
	rootMargin: string,
) {
	const ref = useRef<T | null>(null);
	const [isInView, setIsInView] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsInView(entry.isIntersecting);
			},
			{
				root: null,
				rootMargin,
				threshold: amount,
			},
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [amount, rootMargin]);

	return { isInView, ref };
}
