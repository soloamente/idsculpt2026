"use client";

import { cn } from "@idsculpt/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { FadeSection } from "@/components/fade-section";
import {
	IN_VIEW_AMOUNT,
	IN_VIEW_ROOT_MARGIN,
	useInView,
} from "@/components/use-in-view-section";

/** 8px squares flanking the section title — Figma 385:6076 / 385:6078. */
const sectionHeaderSquareClassnames = "size-2 shrink-0 bg-[#202020]";

/** Shared image height so columns stay aligned. */
const CAROUSEL_IMAGE_HEIGHT_CLASS = "h-[min(557px,52vh)] max-h-[557px]";

/** Fixed caption block — one truncated line so the step pill never shifts. */
const CAPTION_BLOCK_CLASS =
	"h-7 shrink-0 overflow-hidden font-semibold text-black text-[clamp(0.875rem,2vw,1.62rem)] leading-7";

const CAPTION_TRANSITION = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface ImprovedIdentitySlide {
	image: string;
	alt: string;
	headline: string;
	subline: string;
	/** Typed route so `next/link` accepts it with `typedRoutes` enabled. */
	href?: Route;
}

const improvedIdentitySlides: ImprovedIdentitySlide[] = [
	{
		image: "/images/home-improved/navia-hero.png",
		alt: "Navia travel app identity and product screens over a city bridge",
		headline: "Discover how we made traveling easier for people",
		subline: "Navia - Identity and digital product design",
		href: "/gallery",
	},
	{
		image: "/images/home-improved/slide-2.png",
		alt: "Mentally brand graphic with bold expressive typography",
		headline: "Discover how attitude becomes a recognizable visual language",
		subline: "Mentally - Interface design",
		href: "/gallery",
	},
	{
		image: "/images/home-improved/slide-3.png",
		alt: "Chili Riders helmet covered in stickers",
		headline: "Explore an identity built for riders who stand out",
		subline: "Chili riders - Identity design",
		href: "/gallery",
	},
];

const slideCount = improvedIdentitySlides.length;

function opacityForSlide(slideIndex: number, activeIndex: number): number {
	if (slideIndex === activeIndex) {
		return 1;
	}
	const distance = Math.abs(slideIndex - activeIndex);
	return distance === 1 ? 0.77 : 0.4;
}

/** Pagination dot — square expands to track, then fill runs; advance fires on `animationend`. */
function CarouselDot({
	isActive,
	slideKey,
	paused,
	autoplayEnabled,
	label,
	onSelect,
	onElapsedComplete,
}: {
	isActive: boolean;
	slideKey: string;
	paused: boolean;
	autoplayEnabled: boolean;
	label: string;
	onSelect: () => void;
	onElapsedComplete: () => void;
}) {
	const fillRef = useRef<HTMLSpanElement>(null);
	const onCompleteRef = useRef(onElapsedComplete);
	onCompleteRef.current = onElapsedComplete;

	useEffect(() => {
		if (!isActive || !autoplayEnabled) {
			return;
		}

		const fill = fillRef.current;
		if (!fill) {
			return;
		}

		const handleEnd = (event: AnimationEvent) => {
			if (
				event.target !== fill ||
				event.animationName !== "improved-identities-progress-fill"
			) {
				return;
			}
			if (fill.dataset.paused === "true") {
				return;
			}
			onCompleteRef.current();
		};

		fill.addEventListener("animationend", handleEnd);
		return () => fill.removeEventListener("animationend", handleEnd);
	}, [isActive, autoplayEnabled, slideKey]);

	return (
		<button
			type="button"
			aria-label={label}
			aria-current={isActive ? "true" : undefined}
			className="inline-flex items-center justify-center p-1 select-none"
			onClick={onSelect}
		>
			<span
				className="t-improved-dot-track relative"
				data-active={isActive ? "true" : "false"}
			>
				{isActive ? (
					<>
						<span aria-hidden className="absolute inset-0 bg-white/40" />
						{autoplayEnabled ? (
							<span
								key={slideKey}
								ref={fillRef}
								data-paused={paused ? "true" : "false"}
								className="improved-identities-progress-fill absolute inset-y-0 left-0 w-full bg-white"
							/>
						) : (
							<span aria-hidden className="absolute inset-0 bg-white" />
						)}
					</>
				) : (
					<span aria-hidden className="absolute inset-0 bg-white" />
				)}
			</span>
		</button>
	);
}

/** Caption under the column — transitions.dev texts reveal; always reserves height. */
function ColumnCaption({
	slide,
	isFeatured,
}: {
	slide: ImprovedIdentitySlide;
	isFeatured: boolean;
}) {
	const blockRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const block = blockRef.current;
		if (!block) {
			return;
		}

		if (isFeatured) {
			block.classList.remove("is-hiding");
			block.classList.remove("is-shown");
			void block.offsetHeight;
			block.classList.add("is-shown");
			return;
		}

		block.classList.remove("is-shown");
		block.classList.add("is-hiding");
		const timeoutId = window.setTimeout(() => {
			block.classList.remove("is-hiding");
		}, 200);
		return () => window.clearTimeout(timeoutId);
	}, [isFeatured, slide.image]);

	const captionLine = `${slide.headline} — ${slide.subline}`;

	return (
		<div
			ref={blockRef}
			className={cn(
				"t-improved-caption-block",
				CAPTION_BLOCK_CLASS,
				!isFeatured && "pointer-events-none opacity-0",
			)}
			aria-hidden={!isFeatured}
		>
			<p
				className="t-improved-caption t-stagger-line t-stagger-line--1 truncate"
				title={captionLine}
			>
				<span className="uppercase">{slide.headline}</span>
				<span className="capitalize">{` — ${slide.subline}`}</span>
			</p>
		</div>
	);
}

export function ImprovedIdentitiesSection() {
	const prefersReducedMotion = useReducedMotion();
	const { ref: inViewRef, isInView } = useInView<HTMLDivElement>(
		IN_VIEW_AMOUNT,
		IN_VIEW_ROOT_MARGIN,
	);

	const [activeIndex, setActiveIndex] = useState(0);
	const [hoverPaused, setHoverPaused] = useState(false);
	const [progressGeneration, setProgressGeneration] = useState(0);

	const autoplayEnabled = !prefersReducedMotion;
	const autoplayPaused = !isInView || hoverPaused;

	const advanceSlide = useCallback(() => {
		setActiveIndex((current) => (current + 1) % slideCount);
		setProgressGeneration((generation) => generation + 1);
	}, []);

	const goToSlide = useCallback((index: number) => {
		setActiveIndex(index);
		setProgressGeneration((generation) => generation + 1);
	}, []);

	const featuredSlide = improvedIdentitySlides[activeIndex]!;

	return (
		<FadeSection
			className="relative flex w-full flex-col items-center gap-12 px-[18px] pt-24 pb-6 md:gap-16 md:pt-28"
			data-header-text="dark"
			id="improved-identities"
		>
			<div className="flex w-full items-center justify-between">
				<span aria-hidden className={sectionHeaderSquareClassnames} />
				<h2 className="max-w-[426px] text-center font-bold text-[clamp(1.75rem,4vw,2.49rem)] uppercase leading-normal">
					How we&apos;ve improved existing identities
				</h2>
				<span aria-hidden className={sectionHeaderSquareClassnames} />
			</div>

			<div
				ref={inViewRef}
				className="flex w-full max-w-[1404px] flex-col items-center gap-3"
			>
				<div
					className="flex w-full flex-col gap-[15px]"
					onPointerEnter={() => setHoverPaused(true)}
					onPointerLeave={() => setHoverPaused(false)}
				>
					<div className="hidden w-full items-stretch gap-4 md:flex md:px-1">
						{improvedIdentitySlides.map((slide, index) => {
							const isFeatured = index === activeIndex;

							return (
								<CarouselColumn
									key={slide.image}
									slide={slide}
									isFeatured={isFeatured}
									targetOpacity={opacityForSlide(index, activeIndex)}
									onSelect={() => goToSlide(index)}
								/>
							);
						})}
					</div>
				</div>

				<div
					className="w-full md:hidden"
					onPointerEnter={() => setHoverPaused(true)}
					onPointerLeave={() => setHoverPaused(false)}
				>
					<AnimatePresence mode="wait">
						<motion.div
							key={featuredSlide.image}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={CAPTION_TRANSITION}
						>
							<FeaturedSlideCard slide={featuredSlide} showCaption />
						</motion.div>
					</AnimatePresence>
				</div>

				<nav
					className="flex shrink-0 items-center justify-center pt-4"
					aria-label="Improved identities carousel"
				>
					<div className="flex items-center rounded-[39px] border border-black/13 bg-black/35 py-[5px] backdrop-blur-[2px]">
						<div className="flex items-center gap-2.5 px-5 py-[15px]">
							{improvedIdentitySlides.map((slide, index) => (
								<CarouselDot
									key={slide.image}
									isActive={index === activeIndex}
									slideKey={`${slide.image}-${activeIndex}-${progressGeneration}`}
									autoplayEnabled={autoplayEnabled}
									label={`Show ${slide.subline}`}
									paused={autoplayPaused}
									onElapsedComplete={advanceSlide}
									onSelect={() => goToSlide(index)}
								/>
							))}
						</div>
					</div>
				</nav>
			</div>
		</FadeSection>
	);
}

function CarouselColumn({
	slide,
	isFeatured,
	targetOpacity,
	onSelect,
}: {
	slide: ImprovedIdentitySlide;
	isFeatured: boolean;
	targetOpacity: number;
	onSelect: () => void;
}) {
	const imageBlock = (
		<div
			className={cn(
				"relative w-full overflow-hidden rounded-2xl",
				CAROUSEL_IMAGE_HEIGHT_CLASS,
			)}
		>
			<Image
				src={slide.image}
				alt={isFeatured ? slide.alt : ""}
				fill
				className="object-cover object-center"
				sizes="(max-width: 768px) 100vw, min(824px, 90vw)"
				priority={slide.image.includes("navia-hero")}
			/>
		</div>
	);

	const columnBody = (
		<>
			{isFeatured && slide.href ? (
				<Link className="group block select-none" href={slide.href}>
					<div className="overflow-hidden rounded-2xl transition-transform duration-200 ease-out group-hover:scale-[0.99]">
						{imageBlock}
					</div>
				</Link>
			) : (
				imageBlock
			)}
			<ColumnCaption slide={slide} isFeatured={isFeatured} />
		</>
	);

	return (
		<div
			className={cn(
				"t-improved-column flex flex-col gap-[15px]",
				!isFeatured &&
					"cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
			)}
			data-featured={isFeatured ? "true" : "false"}
			style={{ opacity: targetOpacity }}
			role={isFeatured ? undefined : "button"}
			tabIndex={isFeatured ? -1 : 0}
			aria-label={isFeatured ? undefined : `Expand ${slide.subline}`}
			onClick={isFeatured ? undefined : onSelect}
			onKeyDown={
				isFeatured
					? undefined
					: (event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								onSelect();
							}
						}
			}
		>
			{columnBody}
		</div>
	);
}

function FeaturedSlideCard({
	slide,
	showCaption,
}: {
	slide: ImprovedIdentitySlide;
	showCaption: boolean;
}) {
	const imageShell = (
		<div className="relative aspect-[824/557] w-full overflow-hidden rounded-2xl">
			<Image
				src={slide.image}
				alt={slide.alt}
				fill
				className="object-cover"
				sizes="100vw"
				priority={slide.image.includes("navia-hero")}
			/>
		</div>
	);

	const captionLine = `${slide.headline} — ${slide.subline}`;
	const caption = showCaption ? (
		<p className={cn("truncate text-left", CAPTION_BLOCK_CLASS)} title={captionLine}>
			<span className="uppercase">{slide.headline}</span>
			<span className="capitalize">{` — ${slide.subline}`}</span>
		</p>
	) : null;

	if (slide.href) {
		return (
			<Link
				className="group flex w-full flex-col gap-[15px] select-none"
				href={slide.href}
			>
				<div className="overflow-hidden rounded-2xl transition-transform duration-200 ease-out group-hover:scale-[0.99]">
					{imageShell}
				</div>
				{caption}
			</Link>
		);
	}

	return (
		<div className="flex w-full flex-col gap-[15px]">
			{imageShell}
			{caption}
		</div>
	);
}
