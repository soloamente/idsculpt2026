"use client";

// Dia Browser's signature gradient — a self-contained drop-in.
//
// A row of N tall, heavily-blurred columns share one vertical rainbow gradient
// and are arranged in a symmetric bell curve (short at the edges, tallest in the
// middle). Reveal modes: mount (rise on load) or scroll (scaleY tracks viewport).

import { useEffect, useId, useRef, useState } from "react";

type Stop = { offset: number; color: string };

export type GradientReveal = "mount" | "scroll" | "none";
/** `element` = this band enters view; `anchor` = a page section (e.g. footer); `page` = whole document. */
export type ScrollBasis = "element" | "page" | "anchor";

// Dia's stops, bottom (0) → top (1): dark ember → blue → near-white → yellow →
// red-orange → magenta → transparent pink.
const DIA_STOPS: Stop[] = [
	{ offset: 0, color: "#340B05" },
	{ offset: 0.1827, color: "#0358F7" },
	{ offset: 0.2837, color: "#5092C7" },
	{ offset: 0.4135, color: "#E1ECFE" },
	{ offset: 0.5866, color: "#FFD400" },
	{ offset: 0.6827, color: "#FA3D1D" },
	{ offset: 0.8029, color: "#FD02F5" },
	{ offset: 1, color: "#FFC0FD00" },
];

const VBW = 1271;
const VBH = 599;

// Height curve fitted to the real Dia footer: a gentle power falloff (not a
// cosine bell), giving the flatter, pyramid-like rise of the original.
function bellHeights(n: number, peak: number, valley: number): number[] {
	const out: number[] = [];
	const mid = (n - 1) / 2;
	for (let i = 0; i < n; i++) {
		const t = mid === 0 ? 0 : Math.abs(i - mid) / mid; // 0 center → 1 edge
		const eased = 1 - t ** 1.24; // 1 at center → 0 at edge
		out.push(peak * VBH * (valley + (1 - valley) * eased));
	}
	return out;
}

export function DiaGradient({
	bars = 9,
	blur = 15,
	peak = 0.98,
	valley = 0.55,
	stops = DIA_STOPS,
	riseMs = 1100,
	reveal = "mount",
	scrollBasis = "element",
	scrollAnchor = "#site-footer",
}: {
	bars?: number;
	blur?: number;
	peak?: number;
	valley?: number;
	stops?: Stop[];
	riseMs?: number;
	reveal?: GradientReveal;
	scrollBasis?: ScrollBasis;
	/** Used when scrollBasis is `anchor` — progress tracks this element entering view. */
	scrollAnchor?: string;
}) {
	const uid = useId().replace(/:/g, "");
	const gradId = `dia-grad-${uid}`;
	const blurId = `dia-blur-${uid}`;
	// Measure against a static box — transformed bounds skew scroll progress.
	const measureRef = useRef<HTMLDivElement>(null);
	// Scroll-linked scale commits straight to the DOM — avoids React batching skips on fast mobile flings.
	const scaleLayerRef = useRef<HTMLDivElement>(null);

	const [mountScaleY, setMountScaleY] = useState(reveal === "none" ? 1 : 0);

	const computeScrollScaleY = () => {
		if (scrollBasis === "page") {
			const maxScroll = Math.max(
				0,
				document.documentElement.scrollHeight - window.innerHeight,
			);
			const scrollTop = window.scrollY;
			const start = maxScroll * 0.35;
			const span = Math.max(1, maxScroll - start);
			return maxScroll <= 0
				? 1
				: Math.max(0, Math.min(1, (scrollTop - start) / span));
		}

		if (scrollBasis === "anchor") {
			const anchor = document.querySelector(scrollAnchor);
			if (!anchor) return 0;
			const r = anchor.getBoundingClientRect();
			const vh = window.innerHeight || 1;
			return Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.65)));
		}

		const el = measureRef.current;
		if (!el) return 0;
		const r = el.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		return Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.65)));
	};

	const paintScrollScaleY = () => {
		const layer = scaleLayerRef.current;
		if (!layer) return;
		const next = computeScrollScaleY();
		layer.style.transform = `scaleY(${next})`;
	};

	useEffect(() => {
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reveal === "none" || reduced) {
			if (reveal === "scroll") {
				paintScrollScaleY();
				scaleLayerRef.current?.style.setProperty("transform", "scaleY(1)");
			} else {
				setMountScaleY(1);
			}
			return;
		}

		if (reveal === "mount") {
			setMountScaleY(0);
			const id = requestAnimationFrame(() =>
				requestAnimationFrame(() => setMountScaleY(1)),
			);
			return () => cancelAnimationFrame(id);
		}

		// Scroll-linked reveal: paint on scroll events instead of a dedicated rAF loop.
		// Lenis (desktop) and native scroll both bridge via `app-scroll` / `scroll`.
		const onLayout = () => paintScrollScaleY();
		paintScrollScaleY();
		window.addEventListener("scroll", onLayout, { passive: true });
		window.addEventListener("resize", onLayout, { passive: true });
		window.addEventListener("app-scroll", onLayout, { passive: true });

		return () => {
			window.removeEventListener("scroll", onLayout);
			window.removeEventListener("resize", onLayout);
			window.removeEventListener("app-scroll", onLayout);
		};
	}, [reveal, scrollBasis, scrollAnchor]);

	const heights = bellHeights(bars, peak, valley);
	const colW = VBW / bars;

	return (
		// Measure this static shell — scaling the inner layer collapses its rect and locks progress at 0.
		<div ref={measureRef} className="h-full w-full" aria-hidden>
			<div
				ref={scaleLayerRef}
				style={{
					height: "100%",
					width: "100%",
					transformOrigin: "bottom",
					transform:
						reveal === "scroll" ? "scaleY(0)" : `scaleY(${mountScaleY})`,
					transition:
						reveal === "mount"
							? `transform ${riseMs}ms cubic-bezier(0.16, 1, 0.3, 1)`
							: undefined,
					willChange: "transform",
				}}
			>
			<svg
				aria-hidden
				style={{ height: "100%", width: "100%" }}
				viewBox={`0 0 ${VBW} ${VBH}`}
				preserveAspectRatio="none"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>Footer gradient glow</title>
				<defs>
					{/* objectBoundingBox units (default): the gradient maps to each rect's
              own box, so every bar shows the full rainbow over its own height —
              a field of full-rainbow columns, the way the real Dia footer does it. */}
					<linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
						{stops.map((s, i) => (
							<stop key={i} offset={s.offset} stopColor={s.color} />
						))}
					</linearGradient>
					<filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation={blur} />
					</filter>
				</defs>
				{heights.map((h, i) => (
					<g key={i} filter={`url(#${blurId})`}>
						<rect
							x={i * colW}
							y={VBH - h}
							width={colW * 1.23}
							height={h}
							fill={`url(#${gradId})`}
						/>
					</g>
				))}
			</svg>
			</div>
		</div>
	);
}
