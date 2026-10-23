import type { CaseStudySlug } from "@/data/gallery-projects";

/** One full-bleed media block in the case-study scroll (exported from Figma sections). */
export interface CaseStudySection {
	/** Stable anchor id for scroll-spy + section menu. */
	id: string;
	/** Label shown in the fixed bottom section navigator. */
	navLabel: string;
	/** Copy in the expanded nav card (Figma 449:136). */
	navDescription?: string;
	src: string;
	alt: string;
}

export interface CaseStudyDocument {
	slug: CaseStudySlug;
	eyebrow: string;
	headline: string;
	sections: CaseStudySection[];
}

const chiliRiders: CaseStudyDocument = {
	slug: "chili-riders",
	eyebrow: "chili riders - brand",
	headline: "An intense, fire-kissed flavor for the bold.",
	sections: [
		{
			id: "chili-introduction",
			navLabel: "introduction",
			navDescription:
				"As day fades into night, warmth gives way to cooler tones. Embracing softer, subdued hues to foster focus in darker environments.",
			src: "/images/case-studies/chili-riders/hero-intro.png",
			alt: "Chili Riders event poster on a concrete wall",
		},
		{
			id: "chili-logo",
			navLabel: "logo design",
			src: "/images/case-studies/chili-riders/mascot-split.png",
			alt: "Chili Riders mascot on black and red panels",
		},
		{
			id: "chili-wordmark",
			navLabel: "brand system",
			src: "/images/case-studies/chili-riders/logo-wordmark-row.png",
			alt: "Chili Riders pattern and wordmark",
		},
		{
			id: "chili-imagery",
			navLabel: "brand imagery",
			src: "/images/case-studies/chili-riders/brand-imagery.png",
			alt: "Red chili on black fabric with RED and CHILI type",
		},
		{
			id: "chili-applications",
			navLabel: "applications",
			src: "/images/case-studies/chili-riders/helmet-stickers.png",
			alt: "Motorcycle helmet covered in Chili Riders stickers",
		},
		{
			id: "chili-typeface",
			navLabel: "typeface",
			src: "/images/case-studies/chili-riders/typeface-block.png",
			alt: "Chili Riders Mouzambik type showcase",
		},
		{
			id: "chili-voice",
			navLabel: "brand voice",
			src: "/images/case-studies/chili-riders/disclaimer-row.png",
			alt: "Chili Riders disclaimer and typeface lockup",
		},
	],
};

const oasis: CaseStudyDocument = {
	slug: "oasis",
	eyebrow: "oasis - brand",
	headline: "the oasis? you found it!",
	sections: [
		{
			id: "oasis-introduction",
			navLabel: "introduction",
			src: "/images/case-studies/oasis/01-hero.png",
			alt: "Oasis Team web product hero on a laptop",
		},
		{
			id: "oasis-overview",
			navLabel: "overview",
			src: "/images/case-studies/oasis/02-section.png",
			alt: "Oasis brand overview",
		},
		{
			id: "oasis-logo",
			navLabel: "logo design",
			src: "/images/case-studies/oasis/03-logo-split.png",
			alt: "Oasis logo construction",
		},
		{
			id: "oasis-stickers",
			navLabel: "applications",
			src: "/images/case-studies/oasis/04-stickers.png",
			alt: "Oasis sticker applications",
		},
		{
			id: "oasis-brand",
			navLabel: "brand imagery",
			src: "/images/case-studies/oasis/05-brand.png",
			alt: "Oasis brand imagery",
		},
		{
			id: "oasis-web",
			navLabel: "web design",
			src: "/images/case-studies/oasis/06-web.png",
			alt: "Oasis marketing site",
		},
		{
			id: "oasis-campaign",
			navLabel: "campaign",
			src: "/images/case-studies/oasis/07-campaign.png",
			alt: "Oasis campaign visuals",
		},
		{
			id: "oasis-team",
			navLabel: "team",
			src: "/images/case-studies/oasis/08-team.png",
			alt: "Oasis team identity touchpoints",
		},
		{
			id: "oasis-type",
			navLabel: "typeface",
			src: "/images/case-studies/oasis/09-type.png",
			alt: "Oasis typography system",
		},
	],
};

const navia: CaseStudyDocument = {
	slug: "navia",
	eyebrow: "Navia - brand & product design",
	headline: "traveling? we made it easier for ya!",
	sections: [
		{
			id: "navia-introduction",
			navLabel: "introduction",
			src: "/images/case-studies/navia/01-hero.png",
			alt: "Navia app dashboard on a phone in hand",
		},
		{
			id: "navia-logo",
			navLabel: "logo design",
			src: "/images/case-studies/navia/02-logo-grid.png",
			alt: "Navia logo grid",
		},
		{
			id: "navia-chat",
			navLabel: "product ui",
			src: "/images/case-studies/navia/03-chat.png",
			alt: "Navia conversational UI",
		},
		{
			id: "navia-interface",
			navLabel: "interface",
			src: "/images/case-studies/navia/04-ui.png",
			alt: "Navia product UI screens",
		},
		{
			id: "navia-brand",
			navLabel: "brand",
			src: "/images/case-studies/navia/05-brand.png",
			alt: "Navia brand applications",
		},
		{
			id: "navia-product",
			navLabel: "product",
			src: "/images/case-studies/navia/06-product.png",
			alt: "Navia product flows",
		},
		{
			id: "navia-summary",
			navLabel: "summary",
			src: "/images/case-studies/navia/07-summary.png",
			alt: "Navia identity summary",
		},
		{
			id: "navia-closing",
			navLabel: "closing",
			src: "/images/case-studies/navia/08-closing.png",
			alt: "Navia closing brand visuals",
		},
	],
};

const caseStudyBySlug: Record<CaseStudySlug, CaseStudyDocument> = {
	"chili-riders": chiliRiders,
	oasis,
	navia,
};

export function getCaseStudy(slug: CaseStudySlug): CaseStudyDocument {
	return caseStudyBySlug[slug];
}

/** Canonical scroll order — each case study page stacks every following project inline. */
export const CASE_STUDY_SCROLL_ORDER: readonly CaseStudySlug[] = [
	"chili-riders",
	"oasis",
	"navia",
];

/** Slugs rendered below `start` on one long scroll (includes `start`). */
export function getCaseStudyScrollChain(start: CaseStudySlug): CaseStudySlug[] {
	const index = CASE_STUDY_SCROLL_ORDER.indexOf(start);
	if (index === -1) {
		return [start];
	}
	return CASE_STUDY_SCROLL_ORDER.slice(index);
}

/** Next project still on the same page, or `null` after the last case study. */
export function getNextCaseStudySlug(
	current: CaseStudySlug,
): CaseStudySlug | null {
	const index = CASE_STUDY_SCROLL_ORDER.indexOf(current);
	if (index === -1 || index >= CASE_STUDY_SCROLL_ORDER.length - 1) {
		return null;
	}
	return CASE_STUDY_SCROLL_ORDER[index + 1] ?? null;
}
