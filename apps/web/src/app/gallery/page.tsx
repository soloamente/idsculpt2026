import Image from "next/image";
import Link from "next/link";
import {
	FadeFooter,
	FadeInSection,
	FadeSection,
} from "@/components/fade-section";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/contact";

export default function Gallery() {
	const works = [
		{
			image: "/images/tenryuu.png",
			alt: "Tenryuu",
			title: "Tenryuu",
			type: "Brand Design",
			description: "A unique visual identity for a Japanese restaurant",
		},
		{
			image: "/images/chili.png",
			alt: "Chili Riders",
			title: "Chili Riders",
			type: "Brand Identity",
			description: "A unique visual identity for a motorcycle club",
		},
		{
			image: "/images/mentally.png",
			alt: "Mentally",
			title: "Mentally",
			type: "App Design",
			description: "A unique mental health app design",
		},
		{
			image: "/images/navia.png",
			alt: "Navi",
			title: "Navi",
			type: "App Design",
			description: "A unique visual identity for a navigation app",
		},
		{
			image: "/images/oasis-web.png",
			alt: "Oasis",
			title: "Oasis",
			type: "Website Design",
			description: "A unique visual identity for a travel app",
		},
		{
			image: "/images/tenryuu-posters.png",
			alt: "Tenryuu",
			title: "Tenryuu",
			type: "Brand Design",
			description: "A unique visual identity for a Japanese restaurant",
		},
	];

	const socialClassnames =
		"hover:scale-98 hover:opacity-50 transition-all duration-200 ease-in-out will-change-transform";
	return (
		<main className="relative min-h-screen overflow-hidden">
			<FadeSection
				className="relative flex w-full flex-col items-center justify-center text-pretty px-4 pt-100 pb-30 uppercase"
				data-header-text="dark"
				id="gallery-intro"
			>
				<p className="text-sm opacity-50">Gallery</p>
				<h1 className="max-w-3xl text-center font-medium text-2xl leading-tight">
					Our offerings, <br /> a canvas of creativity.
				</h1>
			</FadeSection>
			{/* Griglia statica: ogni card ha il proprio FadeInSection (observer + fade) */}
			<section
				className="relative flex min-h-screen w-full flex-col items-center justify-center gap-28 text-balance px-4 pt-40 pb-8 uppercase"
				data-header-text="dark"
				id="gallery-grid"
			>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{works.map((work, index) => (
						<FadeInSection
							key={`${work.image}-${index}`}
							className="relative aspect-square bg-[#F8F7F7]"
						>
							<Image
								src={work.image}
								alt={work.alt}
								loading="eager"
								width={5000}
								height={5000}
							/>
							<div className="absolute right-0 bottom-0 left-0 p-4 text-center uppercase">
								<h3 className="font-medium opacity-50">{work.title}</h3>
								<p className="text-xs opacity-25">{work.type}</p>
							</div>
						</FadeInSection>
					))}
				</div>
			</section>
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
