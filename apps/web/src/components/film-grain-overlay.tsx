"use client";

import { cn } from "@idsculpt/ui/lib/utils";
import { useId } from "react";

interface FilmGrainOverlayProps {
	className?: string;
}

/**
 * Lightweight film grain — SVG turbulence tile replaces the legacy 7.5MB PNG overlay.
 * No network fetch; same visual role (`mix-blend-overlay`) with far less decode/memory cost.
 */
export function FilmGrainOverlay({ className }: FilmGrainOverlayProps) {
	const filterId = useId().replace(/:/g, "");

	return (
		<div
			aria-hidden
			className={cn(
				"pointer-events-none absolute inset-0 z-30 min-h-0 w-full overflow-hidden opacity-70 mix-blend-overlay",
				className,
			)}
		>
			<svg
				className="h-full w-full"
				preserveAspectRatio="none"
				aria-hidden
				role="presentation"
			>
				<filter id={filterId}>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.75"
						numOctaves="3"
						stitchTiles="stitch"
					/>
				</filter>
				<rect width="100%" height="100%" filter={`url(#${filterId})`} />
			</svg>
		</div>
	);
}
