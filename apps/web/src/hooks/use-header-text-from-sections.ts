"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Matches `data-header-text` on sections: light → white nav, dark → black nav. */
export type HeaderTextMode = "dark" | "light";

const DEFAULT_MODE: HeaderTextMode = "light";

/** Vertical sample point (px from top of viewport) — just below the fixed header band. */
const SAMPLE_Y_PX = 96;

/**
 * Finds which marked region (`[id][data-header-text]`) sits under SAMPLE_Y_PX and
 * returns its declared text mode. Falls back to the nearest section by vertical distance.
 */
function resolveHeaderTextMode(): HeaderTextMode {
	if (typeof document === "undefined") {
		return DEFAULT_MODE;
	}

	const nodes = document.querySelectorAll<HTMLElement>(
		"main [id][data-header-text]",
	);
	const list = Array.from(nodes).filter((el) => {
		const v = el.dataset.headerText;
		return v === "light" || v === "dark";
	});

	if (list.length === 0) {
		return DEFAULT_MODE;
	}

	const y = SAMPLE_Y_PX;
	let found: HTMLElement | null = null;

	for (const el of list) {
		const r = el.getBoundingClientRect();
		if (r.top <= y && r.bottom >= y) {
			found = el;
			break;
		}
	}

	if (!found) {
		let best: HTMLElement | null = null;
		let bestDist = Number.POSITIVE_INFINITY;
		for (const el of list) {
			const r = el.getBoundingClientRect();
			const mid = (r.top + r.bottom) / 2;
			const d = Math.abs(mid - y);
			if (d < bestDist) {
				bestDist = d;
				best = el;
			}
		}
		found = best;
	}

	const mode = found?.dataset.headerText;
	return mode === "dark" || mode === "light" ? mode : DEFAULT_MODE;
}

/**
 * Drives header foreground color from the section/footer under the top sample line.
 * Re-runs on scroll, resize, route changes, and DOM updates (ResizeObserver on document.body).
 */
export function useHeaderTextFromSections(): HeaderTextMode {
	const pathname = usePathname();
	const [mode, setMode] = useState<HeaderTextMode>(DEFAULT_MODE);

	useEffect(() => {
		// Re-subscribe when the route changes so we immediately re-sample new `[data-header-text]` nodes.
		void pathname;

		let raf = 0;

		const tick = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				const next = resolveHeaderTextMode();
				setMode((prev) => (prev === next ? prev : next));
			});
		};

		tick();

		window.addEventListener("scroll", tick, { passive: true });
		window.addEventListener("resize", tick);

		const ro = new ResizeObserver(tick);
		ro.observe(document.documentElement);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("scroll", tick);
			window.removeEventListener("resize", tick);
			ro.disconnect();
		};
	}, [pathname]);

	return mode;
}
