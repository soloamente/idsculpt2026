/** Shared studio line. Intro on home and case-study footers stay in sync. */
export const STUDIO_INTRO =
	"A brand design studio in Italy. We design visual identities. Art history does more of the work than last year's trends.";

/** Single short title above the home service grid (no duplicate "What we do" kicker). */
export const HOME_POST_RAIL_TITLE =
	"We design the identity first. The product and the campaign have to match it.";

/** Supporting message directly under the headline; the four cards spell it out in detail below. */
export const HOME_POST_RAIL_MESSAGE =
	"Positioning comes before design. Without that, later work has nothing to match.";

/**
 * Four service cards (2×2 grid). Reference: white tiles, thin-line glyph up top, title and tagline.
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
		title: "Brand Identity",
		tagline:
			"Positioning and a visual identity. Art direction included, so the pictures don't fight the logo.",
		icon: "orbit",
	},
	{
		num: "02",
		title: "Digital Products",
		tagline:
			"Sites and products that match the identity. If they look right and work badly, they aren't finished.",
		icon: "stack",
	},
	{
		num: "03",
		title: "Creative Campaigns",
		tagline:
			"Campaigns in the feed and on the wall. If the poster and the post don't match, we start over.",
		icon: "frame",
	},
	{
		num: "04",
		title: "Design Systems",
		tagline:
			"We write down type, color, and spacing, so the next page doesn't invent a new brand.",
		icon: "grid",
	},
] as const;
