"use client";

import { SkulletRevealOnView } from "@/components/skullet-reveal-on-view";

/** Case-study detail paragraph between hero and following frames. */
export function ProjectDetailSkullet({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SkulletRevealOnView
			label="Loading project detail"
			className="project-second"
		>
			{children}
		</SkulletRevealOnView>
	);
}
