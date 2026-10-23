import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyPageContent } from "@/components/case-study/case-study-page-content";
import { getCaseStudy } from "@/data/case-studies";
import { isCaseStudySlug } from "@/data/gallery-projects";

interface CaseStudyPageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	return [
		{ slug: "chili-riders" },
		{ slug: "oasis" },
		{ slug: "navia" },
	];
}

export async function generateMetadata({
	params,
}: CaseStudyPageProps): Promise<Metadata> {
	const { slug } = await params;
	if (!isCaseStudySlug(slug)) {
		return { title: "Case study" };
	}
	const study = getCaseStudy(slug);
	return {
		title: `${study.eyebrow} | Identity Sculpt`,
		description: study.headline,
	};
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
	const { slug } = await params;
	if (!isCaseStudySlug(slug)) {
		notFound();
	}

	const study = getCaseStudy(slug);
	return <CaseStudyPageContent study={study} />;
}
