"use client";

import type { ReactNode } from "react";
import { Skeleton } from "skullet/react";

interface WorkFigureProps {
	/** Read while images decode, in place of the skeleton (Skullet a11y label). */
	label: string;
	className: string;
	children: ReactNode;
}

/**
 * Sized frame for `next/image` (or any `<img>`). Skullet skeletons each image on
 * its own until decode — they do not hold the parent reveal back. The parent
 * must define size (aspect-ratio on the frame, or width/height on the image).
 *
 * @see https://skullet.lochie.me/docs#images
 */
export function WorkFigure({ label, className, children }: WorkFigureProps) {
	return (
		// Fill the tile; the figure resolves percentage height against this box.
		<Skeleton label={label} className="size-full min-h-0">
			<figure className={className} skullet-block="">
				{children}
			</figure>
		</Skeleton>
	);
}
