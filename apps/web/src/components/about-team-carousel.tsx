"use client";

import { cn } from "@idsculpt/ui/lib/utils";
import {
	motion,
	useMotionValue,
	useReducedMotion,
	useSpring,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type {
	FocusEvent as ReactFocusEvent,
	PointerEvent as ReactPointerEvent,
} from "react";

/* ─────────────────────────────────────────────────────────
 * TEAM STAGE (Figma 526:103)
 *
 *  rest     centered profile is sharp; neighbors are smaller,
 *           blurred, and faded — distance 1 then 2+
 *  arrows   step the focused member; the row eases into place
 *  profile  hover anywhere on the member (fine pointer) reveals
 *           that photo, which springs after the cursor and fades
 *           with the tooltip open/close timing
 *
 *  Touch never shows the follower. Reduced motion snaps it.
 * ───────────────────────────────────────────────────────── */

/** Square cursor portrait — matches `.t-team-cursor-photo` in index.css. */
const PHOTO_SIZE = 210;

/** Smooth trail behind the pointer. Low mass, no wobble. */
const PHOTO_SPRING = { stiffness: 140, damping: 20, mass: 0.4 };

export interface AboutTeamMember {
	image: string;
	name: string;
	/** Headline when the design shows a shorter name than `name`. */
	nameLines?: string[];
	roles: string[];
	quote: string;
}

const TEAM_MEMBERS: AboutTeamMember[] = [
	{
		image: "/images/daniele.png",
		name: "Daniele Pisani",
		roles: ["Founder", "Managing Director"],
		quote: "“Vision. Strategy. Impact.”",
	},
	{
		image: "/images/adam.png",
		name: "Adam Adamu",
		roles: ["Co-Founder", "Creative Director"],
		quote: "“life is all the inspiration you need”",
	},
	{
		image: "/images/about/anselmo.png",
		name: "ADGV",
		roles: ["Digital Sculptor", "Multidisciplinary Designer"],
		quote: "“I wish my eyes could take photos”",
	},
	{
		image: "/images/annalaura.png",
		name: "Annalaura Petruzzellis",
		nameLines: ["Annalaura"],
		roles: ["Digital Sculptor", "3D Artist & CGI"],
		quote: "“Giving form to unseen ideas”",
	},
];

/** Glassy nav pill — same language as the site header. */
const navPillClassnames =
	"inline-flex items-center justify-center rounded-full border border-black/13 bg-black/35 backdrop-blur-[2px]";

/** Shared square chip — same spring as gallery preview step dots. */
const TEAM_DOT_INDICATOR = {
	spring: {
		bounce: 0,
		damping: 34,
		stiffness: 380,
		type: "spring" as const,
	},
} as const;

const TEAM_DOT_LAYOUT_ID = "about-team-carousel-dot";

/** Keep the portrait on screen, preferring above-right of the pointer. */
function photoOrigin(clientX: number, clientY: number) {
	const margin = 12;
	let nx = clientX + 28;
	let ny = clientY - Math.round(PHOTO_SIZE * 0.72);
	if (nx + PHOTO_SIZE > window.innerWidth - margin) {
		nx = clientX - PHOTO_SIZE - 28;
	}
	if (ny < margin) {
		ny = clientY + 28;
	}
	if (ny + PHOTO_SIZE > window.innerHeight - margin) {
		ny = window.innerHeight - PHOTO_SIZE - margin;
	}
	if (nx < margin) nx = margin;
	return { nx, ny };
}

function TeamCursorPhoto({
	member,
	shown,
	x,
	y,
}: {
	member: AboutTeamMember | null;
	shown: boolean;
	x: ReturnType<typeof useSpring>;
	y: ReturnType<typeof useSpring>;
}) {
	return (
		<motion.div
			aria-hidden
			className="pointer-events-none fixed top-0 left-0 z-30"
			style={{ x, y }}
		>
			{/* Tooltip show/hide: delayed fade+scale in, instant out. */}
			<div
				className="t-team-cursor-photo"
				data-show={shown ? "true" : "false"}
			>
				{member ? (
					<Image
						src={member.image}
						alt=""
						fill
						sizes={`${PHOTO_SIZE}px`}
						className="object-cover"
						unoptimized={process.env.NODE_ENV === "development"}
					/>
				) : null}
			</div>
		</motion.div>
	);
}

function TeamProfile({
	member,
	offset,
	onSelect,
	onProfileEnter,
	onProfileMove,
	onProfileLeave,
	onNameFocus,
	onNameBlur,
}: {
	member: AboutTeamMember;
	/** Signed steps from the focused member. Negative = left. */
	offset: number;
	onSelect: () => void;
	onProfileEnter: (event: ReactPointerEvent<HTMLElement>) => void;
	onProfileMove: (event: ReactPointerEvent<HTMLElement>) => void;
	onProfileLeave: () => void;
	onNameFocus: (event: ReactFocusEvent<HTMLButtonElement>) => void;
	onNameBlur: (event: ReactFocusEvent<HTMLButtonElement>) => void;
}) {
	const distance = Math.abs(offset);
	const side = offset < 0 ? "left" : offset > 0 ? "right" : "center";
	const displayName = member.nameLines?.join(" ") ?? member.name;

	return (
		<article
			className="t-team-profile flex flex-col items-center gap-8 text-center"
			data-distance={distance}
			data-side={side}
			onClick={() => {
				if (offset !== 0) onSelect();
			}}
			onPointerEnter={onProfileEnter}
			onPointerMove={onProfileMove}
			onPointerLeave={onProfileLeave}
		>
			<button
				type="button"
				className="t-team-name font-bold text-[48px] text-black leading-none select-none"
				onClick={(event) => {
					event.stopPropagation();
					if (offset !== 0) onSelect();
				}}
				onFocus={onNameFocus}
				onBlur={onNameBlur}
			>
				{displayName}
			</button>

			<div className="flex flex-col items-center gap-2.5 font-normal text-[26px] text-[#b3b3b3] capitalize leading-none">
				{member.roles.map((role) => (
					<p key={role}>{role}</p>
				))}
			</div>

			{/* Ruled quote — horizontal rules + vertical accent from the Figma frame. */}
			<div className="relative h-[212px] w-full">
				<img
					alt=""
					src="/images/about/team/quote-rule-v.svg"
					width={212}
					height={1}
					className="pointer-events-none absolute top-0 left-[29px] max-w-none origin-top-left rotate-90"
				/>
				<img
					alt=""
					src="/images/about/team/quote-rules.svg"
					width={406}
					height={139}
					className="pointer-events-none absolute top-[38px] left-0 max-w-none"
				/>
				<p className="pointer-events-none absolute top-[38px] left-0 flex h-[139px] w-[406px] items-center justify-center px-12 text-center font-[family-name:var(--font-team-quote)] font-semibold text-[16.6px] text-[#454545] capitalize leading-normal">
					{member.quote}
				</p>
			</div>
		</article>
	);
}

/** Horizontal team row: typography in focus, portrait follows the name. */
export function AboutTeamCarousel() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [photoMember, setPhotoMember] = useState<AboutTeamMember | null>(null);
	const [photoShown, setPhotoShown] = useState(false);
	const prefersReducedMotion = useReducedMotion();
	const shownRef = useRef(false);
	const reducedRef = useRef(prefersReducedMotion);
	reducedRef.current = prefersReducedMotion;

	const pointerX = useMotionValue(0);
	const pointerY = useMotionValue(0);
	const springX = useSpring(pointerX, PHOTO_SPRING);
	const springY = useSpring(pointerY, PHOTO_SPRING);
	const followX = prefersReducedMotion ? pointerX : springX;
	const followY = prefersReducedMotion ? pointerY : springY;

	const dotTransition = prefersReducedMotion
		? { duration: 0 }
		: TEAM_DOT_INDICATOR.spring;

	const goTo = useCallback((index: number) => {
		setActiveIndex(Math.max(0, Math.min(TEAM_MEMBERS.length - 1, index)));
	}, []);

	const placePhoto = useCallback(
		(clientX: number, clientY: number, immediate: boolean) => {
			const { nx, ny } = photoOrigin(clientX, clientY);
			if (immediate) {
				pointerX.jump(nx);
				pointerY.jump(ny);
				springX.jump(nx);
				springY.jump(ny);
				return;
			}
			pointerX.set(nx);
			pointerY.set(ny);
		},
		[pointerX, pointerY, springX, springY],
	);

	const showPhoto = useCallback(
		(member: AboutTeamMember, clientX: number, clientY: number) => {
			// Snap on the first frame so the fade-in doesn't fly in from 0,0.
			placePhoto(clientX, clientY, !shownRef.current || !!reducedRef.current);
			shownRef.current = true;
			setPhotoMember(member);
			setPhotoShown(true);
		},
		[placePhoto],
	);

	const hidePhoto = useCallback(() => {
		shownRef.current = false;
		setPhotoShown(false);
	}, []);

	return (
		<section
			className="relative z-1 mt-20 w-full py-16 md:mt-[165px] md:py-32"
			data-header-text="dark"
			id="about-team"
			aria-roledescription="carousel"
			aria-label="Team"
		>
			<div className="flex flex-col items-center gap-9">
				<div className="t-team-stage">
					{TEAM_MEMBERS.map((member, index) => (
						<TeamProfile
							key={member.name}
							member={member}
							offset={index - activeIndex}
							onSelect={() => goTo(index)}
							onProfileEnter={(event) => {
								if (event.pointerType !== "mouse") return;
								showPhoto(member, event.clientX, event.clientY);
							}}
							onProfileMove={(event) => {
								if (event.pointerType !== "mouse") return;
								if (!shownRef.current) {
									showPhoto(member, event.clientX, event.clientY);
									return;
								}
								placePhoto(
									event.clientX,
									event.clientY,
									!!reducedRef.current,
								);
							}}
							onProfileLeave={hidePhoto}
							onNameFocus={(event) => {
								const rect = event.currentTarget.getBoundingClientRect();
								showPhoto(member, rect.left + rect.width / 2, rect.top);
							}}
							onNameBlur={(event) => {
								// Keep the photo up while the pointer is still on this member.
								const profile = event.currentTarget.closest(".t-team-profile");
								if (profile?.matches(":hover")) return;
								hidePhoto();
							}}
						/>
					))}
				</div>

				<TeamCursorPhoto
					member={photoMember}
					shown={photoShown}
					x={followX}
					y={followY}
				/>

				<div className="flex items-center gap-2.5 p-2.5">
					<button
						type="button"
						aria-label="Previous team member"
						className={cn(navPillClassnames, "size-12 opacity-50")}
						onClick={() => goTo(activeIndex - 1)}
					>
						<ChevronLeft className="size-6 text-white" strokeWidth={2} />
					</button>

					<div className={cn(navPillClassnames, "px-5 py-4")}>
						<div
							className="flex items-center gap-2.5"
							role="tablist"
							aria-label="Team members"
						>
							{TEAM_MEMBERS.map((member, index) => {
								const isActive = index === activeIndex;
								return (
									<button
										key={member.name}
										type="button"
										role="tab"
										aria-selected={isActive}
										aria-label={`Go to ${member.name}`}
										className={cn(
											"relative size-2 shrink-0 [-webkit-tap-highlight-color:transparent]",
											!isActive && "bg-white/40",
										)}
										onClick={() => goTo(index)}
									>
										{isActive ? (
											<motion.span
												layoutId={TEAM_DOT_LAYOUT_ID}
												aria-hidden
												className="absolute inset-0 bg-white"
												transition={dotTransition}
											/>
										) : null}
									</button>
								);
							})}
						</div>
					</div>

					<button
						type="button"
						aria-label="Next team member"
						className={cn(navPillClassnames, "size-12")}
						onClick={() => goTo(activeIndex + 1)}
					>
						<ChevronRight className="size-6 text-white" strokeWidth={2} />
					</button>
				</div>
			</div>
		</section>
	);
}
