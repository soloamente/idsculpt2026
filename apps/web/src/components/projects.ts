export interface ProjectImage {
	src: string;
	alt: string;
	fit?: "cover" | "contain";
	position?: string;
	background?: string;
	/** Natural frame ratio from the Figma still, e.g. "1384 / 887". */
	aspect?: string;
}

export interface ProjectFull {
	kind: "full";
	image: ProjectImage;
}

export interface ProjectPair {
	kind: "pair";
	images: readonly [ProjectImage, ProjectImage];
}

export type ProjectFrame = ProjectFull | ProjectPair;

/** Known case-study slugs — keeps `/work/…` links compatible with typed routes. */
export type ProjectSlug = "oasis" | "navia" | "chili-riders";

/** Literal paths for Link href (typedRoutes rejects dynamic template strings). */
export const WORK_PROJECT_PATHS: Record<ProjectSlug, `/work/${ProjectSlug}`> = {
	oasis: "/work/oasis",
	navia: "/work/navia",
	"chili-riders": "/work/chili-riders",
};

export interface Project {
	slug: ProjectSlug;
	title: string;
	/** Client / brand name for promos (e.g. next-project dock headline). */
	brand: string;
	/** Short line for nav, meta, and “Next project” links. */
	lede: string;
	/** Large uppercase line on the case-study page. */
	headline: string;
	/** Small uppercase label above the headline. */
	summary: string;
	hero: ProjectImage;
	frames: readonly ProjectFrame[];
}

// Case-study stills exported from Figma IDSC---WEB, one PNG per gallery row.
// oasis ← node 737:12, navia ← 812:105, chili-riders ← 646:9.
// Stills stay in public/work/tenryuu and public/work/travel-app; those folder names are not the projects.
export const PROJECTS = [
	{
		slug: "oasis",
		title: "Oasis",
		brand: "Oasis",
		lede: "the oasis? you found it!",
		headline: "the oasis? you found it!",
		summary: "oasis - brand",
		hero: {
			src: "/work/tenryuu/01.png",
			alt: "Oasis, the mark on a dark field",
			aspect: "1384 / 887",
		},
		frames: [
			{
				kind: "full",
				image: {
					src: "/work/tenryuu/01.png",
					alt: "Oasis, the mark on a dark field",
					aspect: "1384 / 887",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/tenryuu/02.png",
					alt: "Oasis identity still",
					aspect: "1384 / 887",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/tenryuu/03.png",
					alt: "Oasis mark construction",
					aspect: "1384 / 713",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/tenryuu/04.png",
					alt: "Oasis wordmark",
					aspect: "1384 / 910",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/tenryuu/05.png",
					alt: "Oasis colour studies",
					aspect: "1384 / 739",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/tenryuu/06.png",
					alt: "Oasis application",
					aspect: "1384 / 887",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/tenryuu/07.png",
					alt: "Oasis still",
					aspect: "1384 / 887",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/tenryuu/08.png",
					alt: "Oasis pair",
					aspect: "1384 / 713",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/tenryuu/09.png",
					alt: "Oasis closing still",
					aspect: "1384 / 551",
				},
			},
		],
	},
	{
		slug: "navia",
		title: "Navia",
		brand: "Navia",
		lede: "traveling? we made it easier for ya!",
		headline: "traveling? we made it easier for ya!",
		summary: "Navia - brand & product design",
		hero: {
			src: "/work/travel-app/01.png",
			alt: "Navia, a phone in a warm field",
			aspect: "1384 / 887",
		},
		frames: [
			{
				kind: "full",
				image: {
					src: "/work/travel-app/01.png",
					alt: "Navia, a phone in a warm field",
					aspect: "1384 / 887",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/travel-app/02.png",
					alt: "Navia screens",
					aspect: "1384 / 713",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/travel-app/03.png",
					alt: "Navia interface details",
					aspect: "1384 / 551",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/travel-app/04.png",
					alt: "Navia in the hand",
					aspect: "1384 / 713",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/travel-app/05.png",
					alt: "Navia map",
					aspect: "1384 / 551",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/travel-app/06.png",
					alt: "Navia product spread",
					aspect: "1384 / 713",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/travel-app/07.png",
					alt: "Navia wide still",
					aspect: "1384 / 910",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/travel-app/08.png",
					alt: "Navia closing still",
					aspect: "1384 / 910",
				},
			},
		],
	},
	{
		slug: "chili-riders",
		title: "Chili Riders",
		brand: "Chili Riders",
		// Copy from Figma IDSC---WEB node 646:9 (Chili Riders case study).
		lede: "Hot sauce brand for the night ride.",
		headline: "An intense, fire-kissed flavor for the bold.",
		summary: "chili riders - brand",
		hero: {
			src: "/work/chili-riders/hero.png",
			alt: "Chili Riders poster on a concrete wall",
		},
		// Nine stills in six lines — order matches Figma 646:13 → 678:447 (no cover; gallery only).
		frames: [
			{
				kind: "full",
				image: {
					src: "/work/chili-riders/hero.png",
					alt: "Chili Riders event poster on a concrete wall",
					background: "#ffffff",
				},
			},
			{
				kind: "pair",
				images: [
					{
						src: "/work/chili-riders/pair-left.png",
						alt: "Chili Riders mascot on black",
						background: "#121011",
					},
					{
						src: "/work/chili-riders/pair-right.png",
						alt: "Chili Riders logo on red",
						background: "#e8443c",
					},
				],
			},
			{
				kind: "pair",
				images: [
					{
						src: "/work/chili-riders/pattern.png",
						alt: "Chili Riders repeat pattern on red",
						background: "#e8443c",
					},
					{
						src: "/work/chili-riders/pair-left.png",
						alt: "Chili Riders mascot lockup on black",
						background: "#121011",
					},
				],
			},
			{
				kind: "full",
				image: {
					src: "/work/chili-riders/full.png",
					alt: "Chili Riders brand imagery, red pepper on black silk",
					background: "#221c1e",
				},
			},
			{
				kind: "full",
				image: {
					src: "/work/chili-riders/big text.png",
					alt: "Chili Riders typeface, riding but fast",
					background: "#121011",
				},
			},
			{
				kind: "pair",
				images: [
					{
						src: "/work/chili-riders/disclaimer left.png",
						alt: "Disclaimer, no chili harmed during this project",
						background: "#121011",
					},
					{
						src: "/work/chili-riders/typeface right.png",
						alt: "Mouzambik typeface on red",
						background: "#e8443c",
					},
				],
			},
		],
	},
] as const satisfies readonly Project[];

export function getProject(slug: string): Project | undefined {
	return PROJECTS.find((project) => project.slug === slug);
}

/** Next case study in gallery order (wraps from last → first). */
export function getNextProject(slug: ProjectSlug): Project {
	const index = PROJECTS.findIndex((project) => project.slug === slug);
	const nextIndex = index === -1 ? 0 : (index + 1) % PROJECTS.length;
	const next = PROJECTS[nextIndex];
	if (!next) {
		return PROJECTS[0];
	}
	return next;
}
