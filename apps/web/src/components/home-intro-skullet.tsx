"use client";

import { SkulletRevealOnView } from "@/components/skullet-reveal-on-view";

/** Home intro paragraph — same skullet treatment as the rest of the marketing site. */
export function HomeIntroSkullet({ children }: { children: React.ReactNode }) {
	return (
		<section className="flex shrink-0 items-start justify-center px-[30px] pt-24 pb-12 md:pt-[250px] md:pb-[150px]">
			<SkulletRevealOnView label="Loading studio introduction">
				{children}
			</SkulletRevealOnView>
		</section>
	);
}
