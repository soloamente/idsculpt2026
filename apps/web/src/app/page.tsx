import Image from "next/image";
import Link from "next/link";
import { DesignApproachSection } from "@/components/design-approach-section";
import { DesignTasteBentoSection } from "@/components/design-taste-bento-section";
import { FadeFooter, FadeSection } from "@/components/fade-section";
import { FooterDiaGradient } from "@/components/footer-dia-gradient";
import { HeroShaderBackground } from "@/components/hero-shader-background";
import {
	CONTACT_EMAIL,
	CONTACT_PHONE_DISPLAY,
	CONTACT_PHONE_TEL,
} from "@/lib/contact";

export default function Home() {
	const works = [
		{
			image: "/images/Frame 1221.png",
			alt: "Tenryuu",
			title: "Tenryuu",
			type: "Identity Design",
		},
		{
			image: "/images/Frame 121.png",
			alt: "Chili Riders",
			title: "Chili Riders",
			type: "Identity Design",
		},
	];

	const socialClassnames =
		"hover:scale-98 hover:opacity-50 transition-all duration-200 ease-in-out will-change-transform";
	/** Stessa pill del CTA Discover / header Email us, adattata a testo nero su sfondo chiaro. */
	const contactPillClassnames =
		"inline-flex items-center rounded-full border border-black/10 bg-white/50 px-5 py-2.5 font-medium text-black text-sm backdrop-blur-sm transition-all duration-200 ease-out will-change-auto hover:scale-98 hover:opacity-50";
	// Frammenti hero: l'effetto blur graduale (sopra → sotto) vale solo su `heroBrand` (i glifi sfocano davvero via `filter: blur` sullo strato mascherato).
	const heroHeadlineBefore = "Welcome to ";
	const heroBrand = "Identity/Sculpt";
	const heroHeadlineAfter =
		", a lively brand design studio in Italy. We focus on creating unique visual identities, driven by our passion for design and commitment to excellence.";
	return (
		<main className="relative min-h-screen overflow-hidden">
			{/* data-header-text drives fixed nav color when this band is under the header sample line. */}
			<FadeSection
				className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 text-pretty px-4 pt-40 pb-8 text-white uppercase"
				data-header-text="light"
				id="hero"
			>
				<HeroShaderBackground />
				{/* Grana globale: vedi `layout.tsx`. */}
				<h1 className="relative z-10 max-w-3xl text-center font-medium text-2xl leading-tight">
					{/* `inline-block` dà al solo brand un box per allineare strato nitido + strato con blur sui glifi. */}
					<span className="block text-pretty">
						{heroHeadlineBefore}
						{/* z-index: lo strato sfocato deve stare sopra quello netto, altrimenti non vedi il blur. */}
						<span className="relative inline-block align-baseline text-current">
							<span className="relative z-1">{heroBrand}</span>
							{/* Maschera: in alto "white" = strato visibile; verso il basso fade a trasparente così sotto emerge il testo netto. Con `black` in cima l’overlay restava invisibile (luminance mask). */}
							<span
								className="mask-[linear-gradient(to_bottom,white,transparent_70%)] pointer-events-none absolute inset-0 z-2 block blur-2xl [-webkit-mask-image:linear-gradient(to_bottom,white,transparent_70%)]"
								aria-hidden
							>
								{heroBrand}
							</span>
						</span>
						{heroHeadlineAfter}
					</span>
				</h1>
				{/* Stessa identità del CTA header “Email us”: pill vetrosa + quadrato + label; scroll alla sezione work. */}
				<Link
					className="relative z-10 inline-flex items-center rounded-full border border-black/10 bg-black/40 px-5 py-2.5 font-medium text-sm backdrop-blur-sm transition-all duration-200 ease-out will-change-auto hover:scale-98 hover:opacity-50"
					href="#work"
				>
					<span className="inline-flex items-center gap-1">
						<span aria-hidden className="size-[0.4em] shrink-0 bg-current" />
						Discover
					</span>
				</Link>
			</FadeSection>
			<FadeSection
				className="relative flex min-h-screen w-full flex-col items-center justify-center gap-28 text-balance px-4 pt-40 pb-8"
				data-header-text="dark"
				id="work"
			>
				<div className="flex max-w-md flex-col items-center justify-center gap-8">
					<h2 className="text-center font-bold text-3xl uppercase leading-tight">
						A glimpse of our work
					</h2>
					<p className="text-center text-base">
						Visually stunning, interactive website made to assert your digital
						dominance and captivate.
					</p>
				</div>
				<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
					{works.map((work, index) => (
						<article
							key={`${work.image}-${index}`}
							className="flex w-full flex-col gap-3"
						>
							{/* Same square footprint as the old wrapper; only the image lives inside. */}
							<div className="relative aspect-square w-full overflow-hidden rounded-2xl">
								<Image
									src={work.image}
									alt={work.alt}
									className="size-full object-cover"
									height={5000}
									loading="eager"
									width={5000}
								/>
							</div>
							<div className="flex flex-col items-start gap-1.5">
								<span
									aria-hidden
									className="mt-[0.35em] size-[0.4em] shrink-0 bg-black text-current"
								/>
								<div className="text-left font-semibold text-lg capitalize">
									<h3 className="font-semibold">{work.title}</h3>
									<p className="opacity-50">{work.type}</p>
								</div>
							</div>
						</article>
					))}
				</div>
			</FadeSection>
			<DesignApproachSection />
			<DesignTasteBentoSection />
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

			<FadeFooter
				className="relative z-10 flex w-full flex-col items-center justify-center gap-4 text-pretty px-4 pt-40 pb-8 text-white uppercase"
				data-header-text="light"
				id="site-footer"
			>
				<div className="flex w-full items-center justify-between gap-0 text-sm md:text-base lg:text-lg">
					{/* Mobile: © + year only; md+: full legal line. */}
					<p className="opacity-50">
						<span className="md:hidden">© {new Date().getFullYear()}</span>
						<span className="hidden md:inline">
							Copyright © {new Date().getFullYear()} Identity Sculpt. All rights
							reserved.
						</span>
					</p>
					<div className="flex items-center gap-12 font-bold uppercase">
						<Link
							href="https://www.instagram.com/identitysculpt/"
							className={socialClassnames}
						>
							Instagram
						</Link>
						<Link
							href="https://www.linkedin.com/company/identitysculpt/"
							className={socialClassnames}
						>
							Are.na
						</Link>
						<Link
							href="https://www.facebook.com/identitysculpt/"
							className={socialClassnames}
						>
							X <span className="hidden opacity-50 md:inline">(Twitter)</span>
						</Link>
					</div>
				</div>
				<div className="w-full w-full">
					<Image
						src="/images/logo.svg"
						alt="Identity Sculpt"
						width={5000}
						height={5000}
					/>
				</div>
			</FadeFooter>
		</main>
	);
}
