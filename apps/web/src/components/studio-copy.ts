/** Shared studio line — intro on home and case-study footers stay in sync. */
export const STUDIO_INTRO =
	"A lively brand design studio based in Italy. We focus on creating unique visual identities, driven by our passion for art and its history, leaving an indelible mark on the projects we curate.";

/** Single short title above the home service grid (no duplicate “What we do” kicker). */
export const HOME_POST_RAIL_TITLE =
	"Logo, product UI, and campaign in one brief.";

/** Supporting message directly under the headline; the four cards spell it out in detail below. */
export const HOME_POST_RAIL_MESSAGE =
	"One palette and one type plan cover the interface and the print run. If the mark shifts, the rest of the system is meant to move with it.";

/**
 * Four service cards (2×2 grid) — reference: white tiles, thin-line glyph up top, title + tagline.
 * `icon` keys map to inline SVGs in HomePostRailSection.
 */
export const HOME_POST_RAIL_CARDS: readonly {
	readonly num: string;
	readonly title: string;
	readonly tagline: string;
	readonly icon: "orbit" | "stack" | "frame" | "grid";
}[] = [
	{
		num: "01",
		title: "Identity",
		tagline: "Marks, voice, and type that stay legible as the story grows.",
		icon: "orbit",
	},
	{
		num: "02",
		title: "Product",
		tagline: "Screens and components where brand rhythm matches interface logic.",
		icon: "stack",
	},
	{
		num: "03",
		title: "Campaign",
		tagline: "Print, spatial, and stills when the idea needs a frame off-screen.",
		icon: "frame",
	},
	{
		num: "04",
		title: "Systems",
		tagline: "Guidelines and handoff so teams ship without drifting the work.",
		icon: "grid",
	},
] as const;
