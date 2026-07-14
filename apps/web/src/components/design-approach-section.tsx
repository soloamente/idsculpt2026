import Image from "next/image";

import { FadeInSection, FadeSection } from "@/components/fade-section";

/** Piccolo quadrato nero come nel mock (titoli, intro, accenti ai lati). */
const approachSquareClassnames =
	"size-[0.4em] shrink-0 bg-black text-current";

const approachPillars = [
	{
		title: "Curation",
		description:
			"Every project starts with deep research into strategy, meaning, perception to define the aesthetics",
		image: "/images/sec3.png",
		alt: "Classical sculpture study for brand curation",
	},
	{
		title: "Brand Sculpting",
		description:
			"Failure is a great way to explore different ideas, not intended as not completing the project, but as a way to try more in order to obtain the perfect way to communicate",
		image: "/images/Frame 147.png",
		alt: "Still-life study for brand sculpting",
	},
	{
		title: "Mixed Media",
		description:
			'Through curation and various attempts, we can determine how to synergistically blend different types of media to breathe life into the identities we sculpt. "Sculpting" means to select the right aspects to carve out, ultimately achieving a complete figure of "identity."',
		image: "/images/Frame 148.png",
		alt: "Textured mixed-media reference",
	},
] as const;

/**
 * Tre pilastri con tile quadrate sopra e copy sotto — titolo/intro come il mock testuale.
 */
export function DesignApproachSection() {
	return (
		<FadeSection
			className="relative flex min-h-screen w-full flex-col items-center justify-center gap-20 text-balance px-4 pt-40 pb-8 md:gap-28"
			data-header-text="dark"
			id="approach"
		>
			<div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8">
				<h2 className="text-center font-bold text-3xl uppercase leading-tight">
					Our approach is based on three pillars
				</h2>

				{/* Intro centrata con quadrati ai lati del testo + accenti agli estremi della riga. */}
				<div className="relative flex w-full items-center justify-center px-8 md:px-16">
					<span
						aria-hidden
						className={`absolute top-1/2 left-0 -translate-y-1/2 ${approachSquareClassnames}`}
					/>
					<span
						aria-hidden
						className={`absolute top-1/2 right-0 -translate-y-1/2 ${approachSquareClassnames}`}
					/>
					<div className="flex max-w-md items-center justify-center gap-3">
						<span aria-hidden className={approachSquareClassnames} />
						<p className="text-center text-base">
							Visually stunning, interactive website made to assert your digital
							dominance and captivate.
						</p>
						<span aria-hidden className={approachSquareClassnames} />
					</div>
				</div>
			</div>

			<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
				{approachPillars.map((pillar) => (
					<FadeInSection
						key={pillar.title}
						className="flex w-full min-w-0 flex-col gap-3"
					>
						{/* Tile quadrata come la griglia work — solo immagine, angoli arrotondati. */}
						<div className="relative aspect-square w-full overflow-hidden rounded-2xl">
							<Image
								src={pillar.image}
								alt={pillar.alt}
								className="size-full object-cover"
								fill
								sizes="(max-width: 768px) 100vw, 33vw"
								unoptimized
							/>
						</div>

						<div className="flex items-start gap-1.5">
							<span
								aria-hidden
								className={`mt-[0.35em] ${approachSquareClassnames}`}
							/>
							<div className="text-left">
								<h3 className="font-semibold text-lg">{pillar.title}</h3>
								<p className="mt-2 text-base leading-relaxed">
									{pillar.description}
								</p>
							</div>
						</div>
					</FadeInSection>
				))}
			</div>
		</FadeSection>
	);
}
