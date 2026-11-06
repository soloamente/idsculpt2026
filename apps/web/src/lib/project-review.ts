import type { Project, ProjectSlug } from "@/components/projects";
import { HOME_REVIEWS, type HomeReview } from "@/lib/home-social-proof";

/**
 * Stable key for matching testimonial `brand` strings to case studies (spacing/punctuation tolerant).
 */
function normalizeBrandKey(label: string): string {
	return label
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

/** Reviews keyed by normalized brand (only entries that name a brand). */
function reviewsByBrand(): Map<string, HomeReview> {
	const map = new Map<string, HomeReview>();
	for (const review of HOME_REVIEWS) {
		if (!review.brand) continue;
		map.set(normalizeBrandKey(review.brand), review);
	}
	return map;
}

const REVIEWS_BY_BRAND = reviewsByBrand();

/**
 * When the published case study `brand` label differs from the testimonial (e.g. product name vs company).
 * Values are normalized keys matching `HOME_REVIEWS[].brand`.
 */
const REVIEW_LOOKUP_BY_SLUG: Partial<Record<ProjectSlug, string>> = {
	// Meyou testimonial is shown on the Navia case study.
	navia: "meyou",
};

/**
 * Pull-quote for `/work/[slug]` when we have a matching `HOME_REVIEWS` entry for this project.
 */
export function getReviewForProject(project: Project): HomeReview | undefined {
	const slugKey = REVIEW_LOOKUP_BY_SLUG[project.slug];
	const lookupKey = slugKey ?? normalizeBrandKey(project.brand);
	return REVIEWS_BY_BRAND.get(lookupKey);
}
