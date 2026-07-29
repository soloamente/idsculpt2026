import { ContactSectionPills } from "@/components/contact-section-pills";
import { AboutTeamCarousel } from "@/components/about-team-carousel";
import { FadeInSection, FadeSection } from "@/components/fade-section";
import { FooterDiaGradient } from "@/components/footer-dia-gradient";
import { SiteFooter } from "@/components/site-footer";
import { WordStickersPlayground } from "@/components/word-stickers/word-stickers-playground";
/** Small square marker flanking centered copy — Figma about pattern. */
function FlankedText({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-9">
			<span aria-hidden className="size-2 shrink-0 bg-[#202020]" />
			<p className={className}>{children}</p>
			<span aria-hidden className="size-2 shrink-0 bg-[#202020]" />
		</div>
	);
}

export default function About() {
	return (
		<main className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
			{/* Full-page sticker field — sits behind all sections, spans entire scroll height. */}
			{/* Above page sections (z-1/z-10) so hit targets receive drags; host stays pointer-events-none. */}
			<WordStickersPlayground className="pointer-events-none absolute inset-0 z-20" />

			<div className="relative z-1 flex flex-col gap-[165px]">
				<FadeSection
					className="relative flex min-h-[1000px] w-full flex-col items-center justify-center gap-16 px-7 py-10 uppercase"
					data-header-text="dark"
					id="about-intro"
				>
					<FadeInSection className="flex max-w-[829px] flex-col items-center gap-4 text-center">
						<p className="text-base text-black/50">about</p>
						<h1 className="font-medium text-[32px] text-[#202020] leading-normal">
							ONE TEAM. ONE VISION.
						</h1>
					</FadeInSection>

					<FadeInSection className="w-full max-w-3xl">
						<FlankedText className="max-w-[462px] text-center font-light text-[23px] text-black normal-case leading-normal">
							Exceptional brands aren't built by individuals. They're sculpted
							through collaboration, where strategy, design and technology work
							together to create something greater than the sum of its parts
						</FlankedText>
					</FadeInSection>
				</FadeSection>
			</div>

			<AboutTeamCarousel />

			<FooterDiaGradient />
			<FadeSection
				className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-8 text-pretty px-4 pt-40 pb-8 text-black"
				data-header-text="dark"
				id="contact"
			>
				<h2 className="max-w-md text-center font-medium text-2xl uppercase leading-tight">
					The First Step Isn't Design. <br /> It's a Conversation
				</h2>
				<ContactSectionPills />
			</FadeSection>

			<SiteFooter />
		</main>
	);
}
