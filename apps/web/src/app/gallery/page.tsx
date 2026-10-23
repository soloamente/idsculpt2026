import Image from "next/image";
import Link from "next/link";

import { ContactSectionPills } from "@/components/contact-section-pills";
import { FadeFooter, FadeSection } from "@/components/fade-section";
import { FooterDiaGradient } from "@/components/footer-dia-gradient";
import { siteFooterShellClassnames } from "@/components/site-footer";
import { GalleryPageContent } from "@/components/gallery-page-content";
import { galleryProjects } from "@/data/gallery-projects";

export default function Gallery() {
	const socialClassnames =
		"hover:scale-98 hover:opacity-50 transition-all duration-200 ease-in-out will-change-transform";

	return (
		<main className="relative min-h-screen overflow-x-hidden">
			<GalleryPageContent projects={galleryProjects} />

			<FooterDiaGradient />

			<FadeSection
				className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 pt-40 pb-8 text-black"
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
						width={5000}
						height={5000}
					/>
				</div>
			</FadeFooter>
		</main>
	);
}
