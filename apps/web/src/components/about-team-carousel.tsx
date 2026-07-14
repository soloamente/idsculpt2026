"use client";

import { cn } from "@idsculpt/ui/lib/utils";
import {
	motion,
	useMotionTemplate,
	useMotionValue,
	useReducedMotion,
	useSpring,
	useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

/* ─────────────────────────────────────────────────────────
 * CARD TILT STORYBOARD (mouse over a card)
 *
 *  rest    flat, scale 1, glare hidden
 *  hover   card lifts to scale 1.02 and tilts toward the
 *          cursor — max ±maxDeg at the edges; a soft glare
 *          spot tracks the pointer across the surface
 *  leave   springs back to flat (interruptible mid-motion)
 *
 *  Skipped entirely for touch pointers and reduced motion.
 * ───────────────────────────────────────────────────────── */
const TILT = {
	maxDeg: 7, // rotation reached at the card edges
	hoverScale: 1.02, // subtle lift while hovered
	glareOpacity: 0.35, // peak strength of the moving highlight
	spring: { stiffness: 220, damping: 24, mass: 0.6 }, // snappy, no wobble
};

/** Figma desktop 420×680; scales down on narrow viewports, full size from md up. */
const TEAM_CARD_CLASS =
	"relative isolate flex aspect-[420/680] w-[min(calc(100vw-3rem),300px)] max-w-[420px] shrink-0 flex-col gap-5 overflow-hidden rounded-3xl px-2.5 py-2.5 shadow-[inset_0_0_0_3px_rgba(255,255,255,0.13)] sm:w-[min(calc(100vw-4rem),340px)] md:w-[420px] md:gap-8";

/** Centers snap scroll — half card width tracks the fluid mobile size. */
const TEAM_SCROLL_PADDING =
	"px-[max(1rem,calc(50%-min(210px,calc((100vw-3rem)/2))))] sm:px-[max(1rem,calc(50%-min(210px,calc((100vw-4rem)/2))))] md:px-[max(1rem,calc(50%-210px))]";

/** Team member card data — matches Figma about carousel. */
export interface AboutTeamMember {
	image: string;
	name: string;
	nameLines?: string[];
	roles: string[];
	quote: string;
	/** Card backdrop — each member has a distinct gradient in Figma. */
	cardClassName: string;
	imageBlend?: "hard-light" | "overlay" | "lighten" | "normal";
}

const TEAM_MEMBERS: AboutTeamMember[] = [
	{
		image: "/images/daniele.png",
		name: "Daniele Pisani",
		roles: ["Co-Founder", "marketing & Adv"],
		quote: "“imagine, see, conquer”",
		cardClassName: "bg-gradient-to-b from-[#1e4fd4] to-[#0b1538]",
		imageBlend: "hard-light",
	},
	{
		image: "/images/adam.png",
		name: "Adam Adamu",
		roles: ["Co-Founder", "designer"],
		quote: "imagine, see, conquer",
		cardClassName: "bg-gradient-to-br from-[#ff5a7a] to-[#6b1428]",
		imageBlend: "overlay",
	},
	{
		image: "/images/about/anselmo.png",
		name: "Anselmo Vicente",
		roles: ["Web & Graphic Designer", "Motion designer"],
		quote: "I wish my eyes could take photos.",
		cardClassName: "bg-gradient-to-b from-[#2a4a8f] to-[#0a1028]",
		imageBlend: "lighten",
	},
	{
		image: "/images/annalaura.png",
		name: "Annalaura Petruzzellis",
		nameLines: ["Annalaura", "Petruzzellis"],
		roles: ["3D Artist & CGI"],
		quote: "“imagine, see, conquer”",
		cardClassName: "bg-gradient-to-br from-[#c9a227] to-[#4a3010]",
		imageBlend: "lighten",
	},
];

/** Glassy nav pill — same language as the site header. */
const navPillClassnames =
	"inline-flex items-center justify-center rounded-full border border-black/13 bg-black/35 backdrop-blur-[2px]";

function SquareMarker({ className }: { className?: string }) {
	return (
		<span aria-hidden className={cn("size-2 shrink-0 bg-white", className)} />
	);
}

function TeamCard({
	member,
	activeProgress,
}: {
	member: AboutTeamMember;
	/** 0 = fully in the background, 1 = centered in focus. */
	activeProgress: number;
}) {
	const nameLines = member.nameLines ?? [member.name];
	const prefersReducedMotion = useReducedMotion();

	// De-emphasize side cards with brightness, not opacity — opacity was tinting the grey field.
	const focusBrightness = 0.6 + activeProgress * 0.4;

	// Normalized pointer position over the card: 0 = left/top edge, 1 = right/bottom.
	// Motion values commit straight to the DOM — no React re-render per mousemove.
	const pointerX = useMotionValue(0.5);
	const pointerY = useMotionValue(0.5);
	const hoverProgress = useMotionValue(0); // 0 = rest, 1 = hovered

	const rotateX = useSpring(
		useTransform(pointerY, [0, 1], [TILT.maxDeg, -TILT.maxDeg]),
		TILT.spring,
	);
	const rotateY = useSpring(
		useTransform(pointerX, [0, 1], [-TILT.maxDeg, TILT.maxDeg]),
		TILT.spring,
	);
	const scale = useSpring(
		useTransform(hoverProgress, [0, 1], [1, TILT.hoverScale]),
		TILT.spring,
	);

	// Glare highlight follows the cursor; fades in/out with hover.
	const glareX = useTransform(pointerX, (v) => `${v * 100}%`);
	const glareY = useTransform(pointerY, (v) => `${v * 100}%`);
	const glareOpacity = useSpring(
		useTransform(hoverProgress, [0, 1], [0, TILT.glareOpacity]),
		TILT.spring,
	);
	const glareBackground = useMotionTemplate`radial-gradient(280px circle at ${glareX} ${glareY}, rgba(255,255,255,0.5), transparent 70%)`;

	const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
		if (
			prefersReducedMotion ||
			event.pointerType !== "mouse" ||
			activeProgress < 0.6
		) {
			return;
		}
		const rect = event.currentTarget.getBoundingClientRect();
		pointerX.set((event.clientX - rect.left) / rect.width);
		pointerY.set((event.clientY - rect.top) / rect.height);
		hoverProgress.set(1);
	};

	const handlePointerLeave = () => {
		pointerX.set(0.5);
		pointerY.set(0.5);
		hoverProgress.set(0);
	};

	// Drop tilt/glare when the card leaves center so background cards don't stay skewed.
	useEffect(() => {
		if (activeProgress < 0.35) {
			pointerX.set(0.5);
			pointerY.set(0.5);
			hoverProgress.set(0);
		}
	}, [activeProgress, hoverProgress, pointerX, pointerY]);

	const blendClassName =
		member.imageBlend === "hard-light"
			? "mix-blend-hard-light"
			: member.imageBlend === "overlay"
				? "mix-blend-overlay"
				: member.imageBlend === "lighten"
					? "mix-blend-lighten"
					: undefined;

	// Portrait layers share the same crop; crossfade avoids blend-mode pop on focus change.
	const portraitClassName = "object-cover object-bottom";

	return (
		// Extra padding on the slot so scale + tilt are not clipped by the scroll row.
		<div className="flex shrink-0 snap-center items-center justify-center px-2 py-6 md:px-3 md:py-10">
			{/* Perspective lives on a static wrapper so the tilt reads as 3D depth. */}
			<div style={{ perspective: 1000 }}>
				<motion.article
					onPointerMove={handlePointerMove}
					onPointerLeave={handlePointerLeave}
					animate={{
						filter: `brightness(${focusBrightness})`,
					}}
					transition={{ duration: 0.2, ease: "easeOut" }}
					style={
						prefersReducedMotion
							? undefined
							: {
									rotateX,
									rotateY,
									scale,
									transformStyle: "preserve-3d",
									backfaceVisibility: "hidden",
								}
					}
					className={cn(TEAM_CARD_CLASS, member.cardClassName)}
				>
					{/* Portrait — crossfade normal vs blend layers while scrolling between cards. */}
					<div className="relative aspect-square w-full overflow-hidden rounded-xl md:rounded-[14px]">
						{blendClassName ? (
							<motion.div
								aria-hidden
								className={cn("absolute inset-0", blendClassName)}
								animate={{ opacity: 1 - activeProgress }}
								transition={{ duration: 0.25, ease: "easeOut" }}
							>
								<Image
									src={member.image}
									alt=""
									fill
									className={portraitClassName}
									sizes="(max-width: 768px) 85vw, 420px"
									unoptimized
								/>
							</motion.div>
						) : null}
						<motion.div
							className="absolute inset-0"
							animate={{ opacity: blendClassName ? activeProgress : 1 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
						>
							<Image
								src={member.image}
								alt={member.name}
								fill
								className={portraitClassName}
								sizes="(max-width: 768px) 85vw, 420px"
								unoptimized
							/>
						</motion.div>
					</div>

					<div className="flex flex-col items-center gap-4 md:gap-8">
						<div className="flex items-center gap-4 md:gap-6">
							<SquareMarker />
							<div className="text-center font-semibold text-[20px] text-white uppercase leading-tight md:text-[26px]">
								{nameLines.map((line) => (
									<p key={line}>{line}</p>
								))}
							</div>
							<SquareMarker />
						</div>

						<div className="flex w-full flex-col gap-1 text-center font-normal text-[18px] text-white/40 capitalize md:text-[26px]">
							{member.roles.map((role) => (
								<p key={role} className="min-h-[1em]">
									{role}
								</p>
							))}
						</div>
					</div>

					{/* Fixed from the card bottom so quotes align across 1- and 2-line names. */}
					<p className="absolute inset-x-2.5 bottom-6 text-center font-semibold text-[16px] text-white capitalize md:bottom-10 md:text-[20px]">
						{member.quote}
					</p>

					{/* Cursor-tracking glare — decorative, never intercepts the pointer. */}
					{!prefersReducedMotion && (
						<motion.div
							aria-hidden
							className="pointer-events-none absolute inset-0 rounded-3xl"
							style={{ background: glareBackground, opacity: glareOpacity }}
						/>
					)}
				</motion.article>
			</div>
		</div>
	);
}

/** How centered a card is in the scroll row (0 = edge, 1 = dead center). */
function getCardActiveProgress(
	container: HTMLDivElement,
	cardIndex: number,
): number {
	const card = container.children[cardIndex] as HTMLElement | undefined;
	if (!card) return 0;

	const viewportCenter = container.scrollLeft + container.clientWidth / 2;
	const cardCenter = card.offsetLeft + card.clientWidth / 2;
	const distance = Math.abs(viewportCenter - cardCenter);
	// Full focus at center; fades out over ~one card width.
	const falloff = card.clientWidth * 0.85;

	return Math.max(0, 1 - distance / falloff);
}

/** Horizontal team carousel with edge fades and pill navigation. */
export function AboutTeamCarousel() {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [cardProgress, setCardProgress] = useState<number[]>(() =>
		TEAM_MEMBERS.map((_, index) => (index === 0 ? 1 : 0)),
	);

	const scrollToIndex = useCallback((index: number) => {
		const container = scrollRef.current;
		if (!container) return;
		const clamped = Math.max(0, Math.min(TEAM_MEMBERS.length - 1, index));
		const card = container.children[clamped] as HTMLElement | undefined;
		if (!card) return;
		const offset =
			card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
		container.scrollTo({ left: offset, behavior: "smooth" });
	}, []);

	// Interpolate focus per card while scrolling — avoids snapping opacity/blend.
	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;

		const onScroll = () => {
			const progresses = TEAM_MEMBERS.map((_, index) =>
				getCardActiveProgress(container, index),
			);
			setCardProgress(progresses);

			let nearest = 0;
			let nearestProgress = -1;
			for (let i = 0; i < progresses.length; i++) {
				if (progresses[i] > nearestProgress) {
					nearestProgress = progresses[i];
					nearest = i;
				}
			}
			setActiveIndex(nearest);
		};

		onScroll();
		container.addEventListener("scroll", onScroll, { passive: true });
		return () => container.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<section
			className="relative z-1 mt-20 w-full py-16 md:mt-[165px] md:py-32"
			data-header-text="dark"
			id="about-team"
		>
			<div className="flex flex-col items-center gap-9">
				<div
					ref={scrollRef}
					className={cn(
						"flex w-full snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible py-4 [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [scrollbar-width:none] md:gap-7 md:py-6 [&::-webkit-scrollbar]:hidden",
						TEAM_SCROLL_PADDING,
					)}
				>
					{TEAM_MEMBERS.map((member, index) => (
						<TeamCard
							key={member.name}
							member={member}
							activeProgress={cardProgress[index] ?? 0}
						/>
					))}
				</div>

				{/* Carousel controls — prev, dots, next. */}
				<div className="flex items-center gap-2.5 p-2.5">
					<button
						type="button"
						aria-label="Previous team member"
						className={cn(navPillClassnames, "size-12 opacity-50")}
						onClick={() => scrollToIndex(activeIndex - 1)}
					>
						<ChevronLeft className="size-6 text-white" strokeWidth={2} />
					</button>

					<div className={cn(navPillClassnames, "px-5 py-4")}>
						<div className="flex items-center gap-2.5">
							{TEAM_MEMBERS.map((member, index) => (
								<button
									key={member.name}
									type="button"
									aria-label={`Go to ${member.name}`}
									aria-current={index === activeIndex ? "true" : undefined}
									className={cn(
										"size-2 shrink-0 transition-colors",
										index === activeIndex ? "bg-white" : "bg-white/40",
									)}
									onClick={() => scrollToIndex(index)}
								/>
							))}
						</div>
					</div>

					<button
						type="button"
						aria-label="Next team member"
						className={cn(navPillClassnames, "size-12")}
						onClick={() => scrollToIndex(activeIndex + 1)}
					>
						<ChevronRight className="size-6 text-white" strokeWidth={2} />
					</button>
				</div>
			</div>
		</section>
	);
}
