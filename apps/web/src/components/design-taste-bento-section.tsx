import Image from "next/image";

import { FadeInSection, FadeSection } from "@/components/fade-section";

/** Quadrato 8px come nel frame Figma 319:71 (titolo sezione). */
const bentoHeaderSquareClassnames = "size-2 shrink-0 bg-[#202020]";

/** Shell condiviso delle tile; l’altezza varia per riga (row 1 più alta su viewport larghi). */
const bentoTileBaseClassnames =
	"relative flex flex-col justify-between overflow-hidden rounded-2xl px-[18px] pt-[38px] pb-[18px]";
const bentoTileRowOneHeightClassnames =
	"h-[303px] md:h-[clamp(303px,26vw,420px)]";
const bentoTileRowTwoHeightClassnames = "h-[303px]";

interface BentoImageHeroCard {
	variant: "image-hero";
	titleLines: [string, string];
	description: string;
	image: string;
	alt: string;
}

interface BentoSolidCard {
	variant: "solid";
	title: string;
	description: string;
	surfaceClassName: string;
	titleClassName: string;
	bodyClassName: string;
	bottomPaddingClassName?: string;
}

interface BentoOverlayCard {
	variant: "overlay";
	title: string;
	description: string;
	surfaceClassName: string;
	overlayImage: string;
	overlayAlt: string;
	titleClassName: string;
	bodyClassName: string;
	bottomPaddingClassName?: string;
}

interface BentoBorderedCard {
	variant: "bordered";
	title: string;
	description: string;
	titleClassName: string;
	bodyClassName: string;
}

type BentoCard =
	| BentoImageHeroCard
	| BentoSolidCard
	| BentoOverlayCard
	| BentoBorderedCard;

const bentoRowOne: BentoCard[] = [
	{
		variant: "image-hero",
		titleLines: ["Research-based", "process"],
		description:
			"Visually stunning, interactive website made to assert your digital dominance and captivate.",
		image: "/images/sec3.png",
		alt: "Ophelia sculpture study for research-based process",
	},
	{
		variant: "solid",
		title: "Knotless design",
		description:
			"Visually stunning, interactive website made to assert your digital dominance and captivate.",
		surfaceClassName: "bg-[#bdbab4]",
		titleClassName: "text-[#353535]",
		bodyClassName: "text-[#1d1d1d]",
		bottomPaddingClassName: "pb-[30px]",
	},
];

const bentoRowTwo: BentoCard[] = [
	{
		variant: "overlay",
		title: "custom design tools",
		description:
			"To the projects we curate, we also provide custom tools to ensure a continuity into the design system.",
		surfaceClassName: "bg-[#c2c0bb]",
		overlayImage: "/images/custom.png",
		overlayAlt: "Sculptural forms for custom design tools",
		titleClassName: "text-[#454545]",
		bodyClassName: "text-[#454545]",
		bottomPaddingClassName: "pb-[30px]",
	},
	{
		variant: "solid",
		title: "visual design",
		description:
			"Visually stunning, interactive website made to assert your digital dominance and captivate.",
		surfaceClassName: "bg-[#303030]",
		titleClassName: "text-white",
		bodyClassName: "text-white",
		bottomPaddingClassName: "pb-[30px]",
	},
	{
		variant: "bordered",
		title: "avant-gardistic approach",
		description:
			"Visually stunning, interactive website made to assert your digital dominance and captivate.",
		titleClassName: "text-[#353535]",
		bodyClassName: "text-[#1d1d1d] bg-[#BDBAB4]",
	},
];

function BentoTileTitle({
	lines,
	className,
}: {
	lines: string | [string, string];
	className: string;
}) {
	if (typeof lines === "string") {
		return (
			<h3
				className={`font-semibold text-[clamp(1.375rem,2.5vw,2rem)] uppercase leading-normal ${className}`}
			>
				{lines}
			</h3>
		);
	}

	return (
		<h3
			className={`font-semibold text-[clamp(1.375rem,2.5vw,2rem)] uppercase leading-normal ${className}`}
		>
			{lines.map((line) => (
				<span key={line} className="block">
					{line}
				</span>
			))}
		</h3>
	);
}

function BentoTileBody({
	description,
	className,
}: {
	description: string;
	className: string;
}) {
	return (
		<p
			className={`max-w-[351px] font-light text-[clamp(1rem,1.8vw,1.44rem)] leading-normal ${className}`}
		>
			{description}
		</p>
	);
}

function BentoTile({
	card,
	shellClassName,
}: {
	card: BentoCard;
	shellClassName: string;
}) {
	const tileClassName = `${bentoTileBaseClassnames} ${shellClassName}`;

	if (card.variant === "image-hero") {
		return (
			<article className={tileClassName}>
				{/* Centrata e leggermente ingrandita così la scultura riempie meglio la tile. */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
					<Image
						src={card.image}
						alt={card.alt}
						className="scale-125 object-cover object-center"
						fill
						sizes="(max-width: 768px) 100vw, 66vw"
					/>
				</div>
				<div className="relative z-1 flex flex-col text-white">
					<BentoTileTitle lines={card.titleLines} className="text-white" />
				</div>
				<BentoTileBody
					description={card.description}
					className="relative z-1 text-white"
				/>
			</article>
		);
	}

	if (card.variant === "overlay") {
		return (
			<article
				className={`${tileClassName} ${card.surfaceClassName} ${card.bottomPaddingClassName ?? ""}`}
			>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 rounded-2xl"
				>
					<Image
						src={card.overlayImage}
						alt=""
						className="size-full object-cover object-bottom opacity-12 mix-blend-luminosity"
						fill
						sizes="33vw"
					/>
				</div>
				<BentoTileTitle
					lines={card.title}
					className={`relative z-1 ${card.titleClassName}`}
				/>
				<BentoTileBody
					description={card.description}
					className={`relative z-1 ${card.bodyClassName}`}
				/>
			</article>
		);
	}

	if (card.variant === "bordered") {
		return (
			<article
				className={`${tileClassName} border border-[#bdbab4] pb-[30px]`}
				// Figma 341:77 — diagonal fade from warm grey (top-left) to transparent (bottom-right).
				style={{
					backgroundImage:
						"linear-gradient(33.15deg, rgb(189, 186, 180) 75.8%, rgba(189, 186, 180, 0) 75%)",
				}}
			>
				<BentoTileTitle lines={card.title} className={card.titleClassName} />
				<BentoTileBody
					description={card.description}
					className={card.bodyClassName}
				/>
			</article>
		);
	}

	return (
		<article
			className={`${tileClassName} ${card.surfaceClassName} ${card.bottomPaddingClassName ?? ""}`}
		>
			<BentoTileTitle lines={card.title} className={card.titleClassName} />
			<BentoTileBody
				description={card.description}
				className={card.bodyClassName}
			/>
		</article>
	);
}

/**
 * Bento “where design meets artistic vision” — allineato al frame Figma 319:71.
 */
export function DesignTasteBentoSection() {
	return (
		<FadeSection
			className="relative flex w-full flex-col items-center justify-center gap-[100px] px-[18px] pt-40 pb-8"
			data-header-text="dark"
			id="capabilities"
		>
			{/* Titolo con quadrati agli estremi, come nel file Figma. */}
			<div className="flex w-full items-center justify-between">
				<span aria-hidden className={bentoHeaderSquareClassnames} />
				<h2 className="max-w-[426px] text-center font-bold text-[clamp(1.75rem,4vw,2.49rem)] uppercase leading-normal">
					where design meets artistic vision
				</h2>
				<span aria-hidden className={bentoHeaderSquareClassnames} />
			</div>

			<div className="flex w-full flex-col gap-1">
				<div className="grid w-full grid-cols-1 gap-1 md:grid-cols-[minmax(0,2.03fr)_minmax(0,1fr)] md:items-stretch">
					<FadeInSection className="h-full">
						<BentoTile
							card={bentoRowOne[0]}
							shellClassName={bentoTileRowOneHeightClassnames}
						/>
					</FadeInSection>
					<FadeInSection className="h-full">
						<BentoTile
							card={bentoRowOne[1]}
							shellClassName={bentoTileRowOneHeightClassnames}
						/>
					</FadeInSection>
				</div>

				<div className="grid w-full grid-cols-1 gap-1 md:grid-cols-3 md:items-stretch">
					{bentoRowTwo.map((card, index) => (
						<FadeInSection key={`bento-row-two-${index}`} className="h-full">
							<BentoTile
								card={card}
								shellClassName={bentoTileRowTwoHeightClassnames}
							/>
						</FadeInSection>
					))}
				</div>
			</div>
		</FadeSection>
	);
}
