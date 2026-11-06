import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { TeamSheet } from "@/components/team-sheet";

export const metadata: Metadata = {
	title: "Team — idsculpt26",
	description: "The people behind I/S",
};

export default function TeamPage() {
	return (
		// One viewport. Opening a member scrolls inside the column under the portrait, not the page.
		<PageShell className="h-svh bg-[#161616]" navbarClassName="text-white">
			<TeamSheet />
		</PageShell>
	);
}
