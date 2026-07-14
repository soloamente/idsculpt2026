import Image from "next/image";
import Link from "next/link";

import { FadeFooter } from "@/components/fade-section";

const socialClassnames =
	"hover:scale-98 hover:opacity-50 transition-all duration-200 ease-in-out will-change-transform";

/** Shared shell — safe-area padding keeps copy/logo above the mobile browser chrome. */
export const siteFooterShellClassnames =
	"relative z-10 flex w-full flex-col items-center justify-center gap-4 text-pretty px-4 pt-40 pb-[max(2rem,env(safe-area-inset-bottom,0px))] text-white uppercase";

/** Shared site footer — homepage markup (copyright, socials, full-width logo). */
export function SiteFooter() {
	return (
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
			<div className="w-full w-full">
				<Image
					src="/images/logo.svg"
					alt="Identity Sculpt"
					width={5000}
					height={5000}
				/>
			</div>
		</FadeFooter>
	);
}
