import { AboutTeamCarousel } from "@/components/about-team-carousel";
import { FadeInSection, FadeSection } from "@/components/fade-section";
import { FooterDiaGradient } from "@/components/footer-dia-gradient";
import { SiteFooter } from "@/components/site-footer";
import { WordStickersPlayground } from "@/components/word-stickers/word-stickers-playground";
import {
	CONTACT_EMAIL,
	CONTACT_PHONE_DISPLAY,
	CONTACT_PHONE_TEL,
} from "@/lib/contact";
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
	/** Stessa pill del CTA Discover / header Email us, adattata a testo nero su sfondo chiaro. */
	const contactPillClassnames =
		"inline-flex items-center rounded-full border border-black/10 bg-white/50 px-5 py-2.5 font-medium text-black text-sm backdrop-blur-sm transition-all duration-200 ease-out will-change-auto hover:scale-98 hover:opacity-50";

	return (
		<main className="relative flex min-h-screen w-full flex-col overflow-hidden">
			{/* Full-page sticker field — sits behind all sections, spans entire scroll height. */}
			<WordStickersPlayground className="pointer-events-none absolute inset-0 z-0" />

			<div className="relative z-1 flex flex-col gap-[165px]">
				<FadeSection
					className="relative flex min-h-[1000px] w-full flex-col items-center justify-center gap-16 px-7 py-10 uppercase"
					data-header-text="dark"
					id="about-intro"
				>
					<FadeInSection className="flex max-w-[829px] flex-col items-center gap-4 text-center">
						<p className="text-base text-black/50">about</p>
						<h1 className="font-medium text-[32px] text-[#202020] leading-normal">
							write some lines about teamwork
						</h1>
					</FadeInSection>

					<FadeInSection className="w-full max-w-3xl">
						<FlankedText className="max-w-[462px] text-center font-light text-[23px] text-black normal-case leading-normal">
							Visually stunning, interactive website made to assert your digital
							dominance and captivate.
						</FlankedText>
					</FadeInSection>
				</FadeSection>

				<FadeInSection className="relative w-full px-4">
					<FlankedText className="max-w-[462px] text-center font-light text-[23px] text-black normal-case leading-normal">
						Here we explain the brand sculpting method.
					</FlankedText>
				</FadeInSection>
			</div>

			<AboutTeamCarousel />

			<FooterDiaGradient />
			<FadeSection
				className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-8 text-pretty px-4 pt-40 pb-8 text-black"
				data-header-text="dark"
				id="contact"
			>
				<h2 className="max-w-xs text-center font-medium text-2xl uppercase leading-tight">
					Start your project with us
				</h2>
				<div className="flex flex-col items-center gap-3">
					<a className={contactPillClassnames} href={`mailto:${CONTACT_EMAIL}`}>
						<span className="inline-flex items-center gap-1">
							<span aria-hidden className="size-[0.4em] shrink-0 bg-current" />
							{CONTACT_EMAIL}
						</span>
					</a>
					<a className={contactPillClassnames} href={`tel:${CONTACT_PHONE_TEL}`}>
						<span className="inline-flex items-center gap-1">
							<span aria-hidden className="size-[0.4em] shrink-0 bg-current" />
							{CONTACT_PHONE_DISPLAY}
						</span>
					</a>
				</div>
			</FadeSection>

			<SiteFooter />
		</main>
	);
}