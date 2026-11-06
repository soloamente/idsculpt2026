"use client";

import { SkulletRevealOnView } from "@/components/skullet-reveal-on-view";

/** Project index copy block (numeral, title, lede, CTA). */
export function HomeProjectCopySkullet({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<SkulletRevealOnView label={label} className="home-project-copy">
			{children}
		</SkulletRevealOnView>
	);
}
