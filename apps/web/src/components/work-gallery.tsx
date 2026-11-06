import { cn } from "@idsculpt26/ui/lib/utils";
import Link from "next/link";

import { SkulletImage } from "@/components/skullet-image";
import {
	WorkCarousel,
	type WorkCarouselTile,
} from "@/components/work-carousel";
import { WorkFigure } from "@/components/work-figure";

// Stills in public/home/crafts. Oasis lives on the Tenryuu case study.
const CRAFTS = [
	{
		id: "tenryuu",
		src: "/home/crafts/tenryuu1.jpg",
		alt: "Tenryuu",
		href: "/work/tenryuu",
	},
	{
		id: "oasis",
		src: "/home/crafts/oasis.jpg",
		alt: "Oasis",
		href: "/work/tenryuu",
	},
	{
		id: "oasis-1",
		src: "/home/crafts/oasis1.jpg",
		alt: "Oasis",
		href: "/work/tenryuu",
	},
	{
		id: "oasis-2",
		src: "/home/crafts/oasis2.jpg",
		alt: "Oasis",
		href: "/work/tenryuu",
	},
	{
		id: "navia",
		src: "/home/crafts/navia1.jpg",
		alt: "Navia",
		href: "/work/travel-app",
	},
	{
		id: "navia-phone",
		src: "/home/crafts/navia_phone.jpg",
		alt: "Navia on a phone",
		href: "/work/travel-app",
	},
	{
		id: "chili-riders",
		src: "/home/crafts/chili-riders1.jpg",
		alt: "Chili Riders",
		href: "/work/chili-riders",
	},
	{
		id: "chili-riders-2",
		src: "/home/crafts/chili-riders2.jpg",
		alt: "Chili Riders",
		href: "/work/chili-riders",
	},
] as const;

const TILES: WorkCarouselTile[] = CRAFTS.map((craft) => ({
	id: craft.id,
	node: (
		<Link
			href={craft.href}
			draggable={false}
			transitionTypes={["page-push"]}
			aria-label={craft.alt}
			className={cn("work-carousel-project-link block size-full")}
		>
			<WorkFigure
				label={`Loading ${craft.alt}`}
				className="relative size-full overflow-hidden"
			>
				<SkulletImage
					src={craft.src}
					alt={craft.alt}
					fill
					loading="eager"
					draggable={false}
					sizes="(max-width: 760px) 92vw, 80vh"
					className="pointer-events-none object-cover"
				/>
			</WorkFigure>
		</Link>
	),
}));

export function WorkGallery({ bleed = false }: { bleed?: boolean }) {
	// No RevealSection here: hero rail must paint at first paint — Motion’s initial opacity:0
	// left the strip invisible when in-view detection lagged (Lenis / large viewport).
	return <WorkCarousel tiles={TILES} bleed={bleed} />;
}
