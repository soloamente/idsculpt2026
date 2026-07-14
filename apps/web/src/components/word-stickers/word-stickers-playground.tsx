"use client";

import { useEffect, useRef } from "react";

import { WordStickers } from "./engine";
import { warmStickerFonts } from "./font-utils";
import { STICKERS } from "./stickers";

type WordStickersPlaygroundProps = {
	className?: string;
};

/**
 * Mounts vinyl word stickers on a full-bleed host (typically absolute inset-0 on a section).
 * Fonts are warmed before the first canvas render; reduced-motion shows a static scatter.
 */
export function WordStickersPlayground({ className }: WordStickersPlaygroundProps) {
	const hostRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;

		const parent = host.parentElement;
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		let engine: WordStickers | null = null;
		let cancelled = false;

		// Stretch the layer to the full scrollable page height as content loads.
		const syncHostSize = () => {
			if (!parent) return;
			host.style.width = `${parent.clientWidth}px`;
			host.style.height = `${parent.scrollHeight}px`;
		};
		syncHostSize();

		let parentRo: ResizeObserver | undefined;
		if (parent) {
			// Observe only when parent exists — TS narrows null before observe().
			parentRo = new ResizeObserver(() => {
				syncHostSize();
			});
			parentRo.observe(parent);
		}

		const boot = async () => {
			await warmStickerFonts(STICKERS);
			if (cancelled) return;
			syncHostSize();
			engine = new WordStickers(host);
			if (reduced) engine.renderStill();
			else engine.start();
		};

		void boot();

		const io = new IntersectionObserver(
			([entry]) => {
				if (!engine || reduced) return;
				if (entry?.isIntersecting) engine.start();
				else engine.stop();
			},
			{ rootMargin: "80px", threshold: 0.05 },
		);
		io.observe(host);

		return () => {
			cancelled = true;
			parentRo?.disconnect();
			io.disconnect();
			engine?.destroy();
		};
	}, []);

	return (
		<div
			ref={hostRef}
			aria-label="Interactive vinyl word stickers — drag to fling"
			className={className}
			role="img"
		/>
	);
}
