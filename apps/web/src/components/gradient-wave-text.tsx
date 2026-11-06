"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

// Same band colours and radial sweep as the previous site's welcome word.
const COLORS = [
	"#8d6869",
	"#5a8ea6",
	"#b9c96e",
	"#c7c571",
	"#cb706f",
	"#7e5e5f",
];
const BAND_GAP = 4;
const BAND_COUNT = 8;
const RANGE = 200;

const BASE = "var(--gradient-wave-base, rgb(29, 29, 31))";
const STOPS = [
	`${BASE} calc((var(--gi) + 0) * 1%)`,
	...Array.from({ length: BAND_COUNT }, (_, index) => {
		const color = COLORS[index % COLORS.length];
		return `${color} calc((var(--gi) + ${(index + 2) * BAND_GAP}) * 1%)`;
	}),
	`${BASE} calc((var(--gi) + ${(BAND_COUNT + 2) * BAND_GAP}) * 1%)`,
].join(", ");

const GRADIENT = `radial-gradient(circle at 50% bottom, ${STOPS})`;

interface GradientWaveTextProps {
	children: ReactNode;
	className?: string;
}

/** One-shot colour sweep clipped to the glyphs. `--gi` is the gradient offset. */
export function GradientWaveText({
	children,
	className,
}: GradientWaveTextProps) {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		// Reduced motion keeps a still cut of the gradient instead of the sweep.
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			node.style.setProperty("--gi", "40");
			return;
		}

		let value = -25;
		let last = performance.now();
		let frame = 0;

		const tick = (now: number) => {
			const dt = Math.min(64, now - last);
			last = now;
			value += dt / 16.6667;
			if (value >= RANGE) {
				node.style.setProperty("--gi", String(RANGE));
				return;
			}
			node.style.setProperty("--gi", String(value));
			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<span
			ref={ref}
			className={className}
			style={
				{
					"--gi": -25,
					backgroundImage: GRADIENT,
					WebkitBackgroundClip: "text",
					backgroundClip: "text",
					WebkitTextFillColor: "transparent",
					color: "transparent",
					WebkitFontSmoothing: "antialiased",
				} as CSSProperties
			}
		>
			{children}
		</span>
	);
}
