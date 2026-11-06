"use client";

import { SkulletRevealOnView } from "@/components/skullet-reveal-on-view";

/** Bio block in the open team member dialog. */
export function TeamMemberCopySkullet({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SkulletRevealOnView
			label="Loading team member bio"
			className="team-copy w-full"
		>
			{children}
		</SkulletRevealOnView>
	);
}
