"use client";

import { SkulletRevealOnView } from "@/components/skullet-reveal-on-view";

/** Case-study lede under the title — skeleton until it scrolls into view. */
export function ProjectHeroSkullet({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="project-hero">
			<SkulletRevealOnView label="Loading project introduction">
				{children}
			</SkulletRevealOnView>
		</div>
	);
}
