import Image from "next/image";
import Link from "next/link";
import { ContactSectionPills } from "@/components/contact-section-pills";
import { DesignApproachSection } from "@/components/design-approach-section";
import { DesignTasteBentoSection } from "@/components/design-taste-bento-section";
import { FadeFooter, FadeSection } from "@/components/fade-section";
import { FooterDiaGradient } from "@/components/footer-dia-gradient";
import { HeroShaderBackgroundLazy } from "@/components/hero-shader-background-lazy";
import { siteFooterShellClassnames } from "@/components/site-footer";

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
	/** Work preview cards — soft transform easing (same curve as DiaGradient rise). */
	const workPreviewEase = "duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]";
	const workPreviewClassnames = "group flex w-full flex-col gap-3 select-none";
	const workPreviewImageClassnames = `relative aspect-square w-full overflow-hidden rounded-2xl transition-transform ${workPreviewEase} group-hover:scale-[0.98]`;
	const workPreviewCaptionClassnames = `text-center uppercase transition-opacity ${workPreviewEase} group-hover:opacity-70`;
	// Frammenti hero: l'effetto blur graduale (sopra → sotto) vale solo su `heroBrand` (i glifi sfocano davvero via `filter: blur` sullo strato mascherato).
	const heroTagline = "Brands aren't remembered by chance. They're sculpted.";
	const heroBrand = "Identity Sculpt";
	const heroSubheadAfter =
		" is an Italian Brand Design Studio creating strategic identities, websites and digital experiences for ambitious brands.";
	return (
		<main className="relative min-h-screen overflow-x-hidden">
			{/* data-header-text drives fixed nav color when this band is under the header sample line. */}
			<FadeSection
				className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 text-pretty px-4 pt-40 pb-8 text-white uppercase"
				data-header-text="light"
				id="hero"
			>
				<HeroShaderBackgroundLazy />
				{/* Grana globale: vedi `layout.tsx`. */}
				<h1 className="relative z-10 flex max-w-3xl flex-col gap-6 text-center font-medium text-2xl leading-tight">
					<span className="block text-pretty">{heroTagline}</span>
					{/* `inline-block` dà al solo brand un box per allineare strato nitido + strato con blur sui glifi. */}
					<span className="block text-pretty">
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
						{heroSubheadAfter}
					</span>
				</h1>
				{/* Stessa identità del CTA header “Email us”: pill vetrosa + quadrato + label; scroll alla sezione work. */}
				<Link
					id="hero-discover"
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
				<div className="flex max-w-lg flex-col items-center justify-center gap-8">
					<h2 className="text-center font-bold text-3xl uppercase leading-tight">
						Sculpted identities
					</h2>
					<p className="text-center text-base">
						Explore a selection of brands, websites and digital experiences
						crafted to build authority, elevate value and leave a lasting
						impression.
					</p>
				</div>
				<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
					{works.map((work, index) => (
						<Link
							key={`${work.image}-${index}`}
							aria-label={`View ${work.title} in gallery`}
							className={workPreviewClassnames}
							href="/gallery"
						>
							{/* Same square footprint as the old wrapper; only the image lives inside. */}
							<div className={workPreviewImageClassnames}>
								<Image
									src={work.image}
									alt={work.alt}
									className="size-full object-cover"
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
								/>
							</div>
							<div className={workPreviewCaptionClassnames}>
								<h3 className="font-medium opacity-50">{work.title}</h3>
								<p className="text-xs opacity-25">{work.type}</p>
							</div>
						</Link>
					))}
				</div>
			</FadeSection>
			<DesignApproachSection />
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

			<FadeFooter
				className={siteFooterShellClassnames}
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
				<div className="w-full">
					<Image
						src="/images/logo.svg"
						alt="Identity Sculpt"
						width={1200}
						height={200}
						sizes="100vw"
						className="h-auto w-full"
					/>
				</div>
			</FadeFooter>
		</main>
	);
}
