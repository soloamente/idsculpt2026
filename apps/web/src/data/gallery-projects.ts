import type { GalleryProject } from "@/components/gallery-project-card";

/** Slugs for published case-study deep dives (must match `case-studies` data). */
export const CASE_STUDY_SLUGS = ["chili-riders", "oasis", "navia"] as const;

export type CaseStudySlug = (typeof CASE_STUDY_SLUGS)[number];

export function isCaseStudySlug(value: string): value is CaseStudySlug {
	return (CASE_STUDY_SLUGS as readonly string[]).includes(value);
}

export function getGalleryProjectBySlug(
	slug: CaseStudySlug,
): GalleryProject | undefined {
	return galleryProjects.find((project) => project.slug === slug);
}

/** True on immersive case-study routes (`/gallery/chili-riders`, etc.) — header shows Return to projects. */
export function isCaseStudyDetailPath(pathname: string): boolean {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length !== 2 || segments[0] !== "gallery") {
		return false;
	}
	const slug = segments[1];
	return slug !== undefined && isCaseStudySlug(slug);
}

/** Portfolio grid data — `slug` + `isCaseStudy` enable the Case studies tab and detail routes. */
export const galleryProjects: GalleryProject[] = [
	{
		images: [
			"/images/tenryuu.png",
			"/images/Frame 122.png",
			"/images/tenryuu-posters.png",
		],
		alt: "Tenryuu",
		title: "Tenryuu",
		type: "Identity design",
	},
	{
		images: ["/images/chili.png", "/images/chili_2.png"],
		alt: "Chili Riders",
		title: "Chili riders",
		type: "Identity design",
		slug: "chili-riders",
		isCaseStudy: true,
		footerPreviewImage:
			"/images/case-studies/chili-riders/next-thumb-1.png",
	},
	{
		images: ["/images/oasis-web.png"],
		alt: "Oasis Team",
		title: "Oasis-team",
		type: "Brand refresh",
		slug: "oasis",
		isCaseStudy: true,
		footerPreviewImage:
			"/images/case-studies/chili-riders/next-thumb-3.png",
	},
	{
		images: ["/images/meyou.png"],
		alt: "Wave Catchers",
		title: "Wave catchers",
		type: "Logo redesign",
	},
	{
		images: ["/images/mentally.png"],
		alt: "Mentally",
		title: "Mentally",
		type: "Interface design",
	},
	{
		images: ["/images/navia.png"],
		alt: "Navia",
		title: "Navia",
		type: "Interface design",
		slug: "navia",
		isCaseStudy: true,
		footerPreviewImage: "/images/case-studies/navia/05-brand.webp",
	},
	{
		images: ["/images/lonewolf.png"],
		alt: "Lonewolf",
		title: "lonewolf",
		type: "Logo design",
	},
	{
		images: ["/images/sydus.png"],
		alt: "Sydus",
		title: "sydus",
		type: "Logo design",
	},
];
