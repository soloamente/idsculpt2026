import { HomeIntroSkullet } from "@/components/home-intro-skullet";
import { HomePostRailSection } from "@/components/home-post-rail-section";
import { HomeReviewsSection } from "@/components/home-reviews-section";
import { PageShell } from "@/components/page-shell";
import { RevealSection } from "@/components/reveal-section";
import { ProjectCloseSection } from "@/components/project-close-section";
import { ProjectFooter } from "@/components/project-footer";
import { STUDIO_INTRO } from "@/components/studio-copy";
import { WorkGallery } from "@/components/work-gallery";
import { CONTACT_NOTE } from "@/lib/contact";

export default function Home() {
	return (
		<PageShell>
			<div className="flex w-full min-w-0 flex-col gap-[87px]">
				<HomeIntroSkullet>
					<p
						className="home-intro-text w-full max-w-[65ch] text-center text-[24px] leading-[1.45] font-normal text-pretty text-[var(--home-ink)] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
						style={{ fontVariationSettings: '"MONO" 0, "DRKM" 0' }}
					>
						{STUDIO_INTRO}
					</p>
				</HomeIntroSkullet>
				<section className="flex h-auto min-h-0 w-full min-w-0 flex-col pb-5 md:h-[calc(100svh-421px)] md:min-h-[420px]">
					<WorkGallery />
				</section>
				{/* Editorial bridge — not a second project grid (the rail is already the index). */}
				<RevealSection className="w-full min-w-0">
					<HomePostRailSection />
				</RevealSection>
				<RevealSection className="w-full min-w-0">
					<HomeReviewsSection />
				</RevealSection>
				<RevealSection className="home-page-bottom w-full min-w-0">
					{/* Same line as navbar contact panel; shown as the section title only (no extra body). */}
					<ProjectCloseSection heading={<h2>{CONTACT_NOTE}</h2>} />
					<ProjectFooter />
				</RevealSection>
			</div>
		</PageShell>
	);
}
