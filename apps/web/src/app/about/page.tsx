import Image from "next/image";
import Link from "next/link";
import {
	FadeFooter,
	FadeInSection,
	FadeSection,
} from "@/components/fade-section";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/contact";

export default function About() {
	const teamMembers = [
		{
			image: "/images/placeholder.png",
			alt: "Daniele Pisani",
			name: "Daniele Pisani",
			role: "Founder & Marketing Director",
			description: "A unique visual identity for a Japanese restaurant",
		},
		{
			image: "/images/placeholder.png",
			alt: "Adam Adamu",
			name: "Adam Adamu",
			role: "Founder & Creative Director",
			description: "A unique visual identity for a Japanese restaurant",
		},
		{
			image: "/images/placeholder.png",
			alt: "Annalaura Petruzzellis",
			name: "Annalaura Petruzzellis",
			role: "3D Artist",
			description: "A unique visual identity for a Japanese restaurant",
		},
		{
			image: "/images/placeholder.png",
			alt: "Anselmo Diogo Guatta Vicente",
			name: "Anselmo Diogo Guatta Vicente",
			role: "Designer, Editor & Developer",
			description: "A unique visual identity for a Japanese restaurant",
		},
	];

	const socialClassnames =
		"hover:scale-98 hover:opacity-50 transition-all duration-200 ease-in-out will-change-transform";
	return (
		<main className="relative min-h-screen overflow-hidden">
			<FadeSection
				className="relative flex w-full flex-col items-center justify-center gap-15 text-pretty px-4 pt-60 pb-30 uppercase"
				data-header-text="dark"
				id="about-intro"
			>
				<FadeInSection className="flex max-w-2xl flex-col gap-4 text-center">
					<p className="text-sm opacity-50">About</p>
					{/* Short intro: same positioning, less repetition than the previous long block. */}
					<h1 className="font-medium text-lg text-xl leading-snug">
						Identity Sculpt is a strategic visual studio for brands that want to
						be perceived at a higher level. Growth starts with perception—not
						visibility. We build cohesive systems of structure, positioning, and
						authority, not scattered assets or surface-level branding.
					</h1>
					<p className="font-medium text-foreground/90 text-lg leading-snug md:text-xl">
						Led by Daniele and Adam, we pair strategy with execution so every
						touchpoint feels deliberate. We work with founders who treat design
						as positioning, not decoration.
					</p>
				</FadeInSection>
				<FadeInSection className="flex flex-col gap-4 text-center">
					<p className="text-sm opacity-50">Our Goal</p>
					<h2 className="max-w-3xl text-center font-medium text-xl leading-tight">
						To sculpt brands that are taken seriously.
					</h2>
				</FadeInSection>
			</FadeSection>
			<section
				className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-28 text-balance px-4 pt-40 pb-8 uppercase"
				data-header-text="dark"
				id="gallery-grid"
			>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{teamMembers.map((member, index) => (
						<FadeInSection
							key={`${member.image}-${index}`}
							className="relative aspect-square bg-[#F8F7F7]"
						>
							<Image
								src={member.image}
								alt={member.alt}
								loading="eager"
								width={5000}
								height={5000}
							/>
							<div className="absolute right-0 bottom-0 left-0 p-4 text-center uppercase">
								<h3 className="font-medium opacity-50">{member.name}</h3>
								<p className="text-xs opacity-25">{member.role}</p>
							</div>
						</FadeInSection>
					))}
				</div>
			</section>
			<FadeSection
				className="relative flex w-full flex-col items-center justify-center gap-30 text-pretty px-4 pt-60 pb-30 uppercase"
				data-header-text="dark"
				id="about-outro"
			>
				<FadeInSection className="flex max-w-2xl flex-col gap-4 text-center">
					<p className="text-sm opacity-50">Why</p>
					{/* Short intro: same positioning, less repetition than the previous long block. */}
					<h1 className="font-medium text-lg leading-tight">
						Identity Sculpt was founded to challenge the ordinary. In a market
						flooded with disposable design and surface-level branding, we create
						structured, deliberate visual identities that elevate perception and
						authority. We work with brands ready to be seen, understood, and
						remembered.
					</h1>
				</FadeInSection>
				<FadeInSection className="flex flex-col gap-4 text-center">
					<p className="text-sm opacity-50">DESIGN ETHOS</p>
					<h2 className="max-w-3xl text-center font-medium text-lg leading-tight">
						We believe design is more than aesthetics — it is strategy made
						visible. Every element is considered, every detail intentional,
						creating identities that communicate coherence, authority, and
						excellence. Our ethos is precision, not decoration.
					</h2>
				</FadeInSection>
				<FadeInSection className="flex flex-col gap-4 text-center">
					<p className="text-sm opacity-50">BRAND SCULPTING METHOD</p>
					<h2 className="max-w-3xl text-center font-medium text-lg leading-tight">
						Our method combines structure, clarity, and visual impact. We start
						by understanding your brand's perception, then design a cohesive
						identity system that guides every interaction. The result is not
						just a logo or asset, but a brand that feels deliberate, controlled,
						and above the ordinary.
					</h2>
				</FadeInSection>
			</FadeSection>
			<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-screen bg-gradient-to-t from-[#3798FF] via-[#85C0FF] to-[#FFFFFF]" />
			<FadeSection
				className="relative flex min-h-screen w-full flex-col items-center justify-center gap-4 text-pretty px-4 pt-40 pb-8 text-white uppercase"
				data-header-text="light"
				id="contact"
			>
				<h2 className="max-w-xs text-center font-medium text-2xl leading-tight">
					Start your project with us
				</h2>
				<div className="flex flex-col gap-0">
					{/* Apply the same vertical text gradient to both contact actions for visual consistency. */}
					<button
						type="button"
						className="bg-linear-to-b from-[#202020] to-80% to-[#868686] bg-clip-text font-medium text-transparent text-xl uppercase transition-all duration-200 ease-in-out hover:scale-98"
					>
						{CONTACT_EMAIL}
					</button>
					<button
						type="button"
						className="bg-linear-to-b from-[#202020] to-80% to-[#868686] bg-clip-text font-medium text-transparent text-xl uppercase transition-all duration-200 ease-in-out hover:scale-98"
					>
						{CONTACT_PHONE_DISPLAY}
					</button>
				</div>
			</FadeSection>

			<FadeFooter
				className="relative flex w-full flex-col items-center justify-center gap-4 text-pretty px-4 pt-40 pb-8 text-white uppercase"
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
