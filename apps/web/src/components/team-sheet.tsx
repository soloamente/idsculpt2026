"use client";

import type {
	CSSProperties,
	MouseEvent,
	KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SkulletImage } from "@/components/skullet-image";

import { TeamMemberCopySkullet } from "@/components/team-member-copy-skullet";
import { TEAM_MEMBERS, type TeamMember } from "@/components/team-members";
import { WorkFigure } from "@/components/work-figure";

// Open portrait size — matches hover card scale (see `.team-slot` in CSS).
const TARGET = 280;
// Nudges the open dialog column slightly above strict vertical center (navbar + optical balance).
const OPEN_COLUMN_LIFT_PX = 56;

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

// Square portrait only — no polaroid frame or pin (fills the card / slot).
function TeamMemberPortrait({ member }: { member: TeamMember }) {
	return (
		<span className="pointer-events-none absolute inset-0 block overflow-hidden select-none">
			{member.image ? (
				<WorkFigure
					label={`Loading ${member.name}`}
					className="relative size-full"
				>
					<SkulletImage
						src={member.image}
						alt={member.name}
						fill
						loading="eager"
						sizes="280px"
						className="object-cover"
					/>
				</WorkFigure>
			) : (
				<span className="flex size-full items-center justify-center bg-neutral-800 text-2xl font-medium text-neutral-500 select-none">
					{getInitials(member.name)}
				</span>
			)}
		</span>
	);
}

// The Digital Lab landing, with the four team members instead of the four lab cards.
// A click scales that portrait to the center. It sits in the column, so scrolling carries it away with the bio and the stills.
export function TeamSheet() {
	const [focus, setFocus] = useState<number | null>(null);
	const [shown, setShown] = useState<number | null>(null);
	const cards = useRef<(HTMLLIElement | null)[]>([]);
	/** Fixed 280×280 shell — matches `.team-slot` for FLIP. */
	const portraits = useRef<(HTMLDivElement | null)[]>([]);
	const triggers = useRef<(HTMLButtonElement | null)[]>([]);
	const dialogRef = useRef<HTMLDivElement>(null);
	const sheetRef = useRef<HTMLElement>(null);
	const returnFocus = useRef<HTMLButtonElement | null>(null);
	const fromRect = useRef<DOMRect | null>(null);
	/** Full card width+height at open — keeps layout stable while the portrait animates to the dialog. */
	const cardOpenSizeRef = useRef<{ width: number; height: number } | null>(null);
	/** Team area height (grid row below navbar); used to vertically center the open column in the sheet. */
	const sheetHeightRef = useRef(0);
	const slotRef = useRef<HTMLDivElement>(null);
	const finishRef = useRef<() => void>(() => {});

	const member = shown !== null ? TEAM_MEMBERS[shown] : null;
	// Vertically center the portrait column in the team sheet (below the navbar), then lift slightly.
	const portraitPad =
		sheetHeightRef.current > 0
			? Math.max(
					48,
					sheetHeightRef.current / 2 - TARGET / 2 - OPEN_COLUMN_LIFT_PX,
				)
			: 48;

	function open(index: number) {
		const portraitEl = portraits.current[index];
		const cardEl = cards.current[index];
		/* FLIP origin: the portrait shell (280×280 — same as dialog `.team-slot`). */
		fromRect.current = portraitEl?.getBoundingClientRect() ?? null;
		if (cardEl) {
			const r = cardEl.getBoundingClientRect();
			cardOpenSizeRef.current = { width: r.width, height: r.height };
		} else {
			cardOpenSizeRef.current = null;
		}
		sheetHeightRef.current =
			sheetRef.current?.getBoundingClientRect().height ?? 0;
		returnFocus.current = triggers.current[index] ?? null;
		setShown(index);
		setFocus(index);
	}

	function close() {
		setFocus(null);
	}

	// Same as backdrop click: dismiss when the focused target is the scroller itself (not column).
	function handleBackdropKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
		if (event.target !== event.currentTarget) return;
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		close();
	}

	// Empty area around the column dismisses. A click on the portrait, the bio, or a still does not.
	function handleDismiss(event: MouseEvent<HTMLDivElement>) {
		const column = event.currentTarget.querySelector(".team-column");
		if (column?.contains(event.target as Node)) return;
		// The scrollbar belongs to the scroller, not the empty field around the column.
		if (event.target === event.currentTarget) {
			const { offsetX, offsetY } = event.nativeEvent;
			if (
				offsetX > event.currentTarget.clientWidth ||
				offsetY > event.currentTarget.clientHeight
			)
				return;
		}
		close();
	}

	// Drop the column after the portrait has scaled back into the row.
	// Focus returns in the effect below: the row card is hidden until this state lands, so focusing here is ignored.
	function finish() {
		setShown(null);
	}
	finishRef.current = finish;

	useLayoutEffect(() => {
		if (shown !== null) return;
		const node = returnFocus.current;
		returnFocus.current = null;
		node?.focus({ preventScroll: true });
	}, [shown]);

	useEffect(() => {
		if (focus === null) return;
		// The dialog has no control of its own. Focus it so Escape lands here, without scrolling a long bio.
		dialogRef.current?.focus({ preventScroll: true });
	}, [focus]);

	useEffect(() => {
		if (shown === null) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			setFocus(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [shown]);

	// Tab stays inside the open member. There is no button in the column, so focus rests on the dialog.
	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog || focus === null) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== "Tab") return;
			const nodes = [
				...dialog.querySelectorAll<HTMLElement>(
					"button, a[href], input, textarea, [tabindex]:not([tabindex='-1'])",
				),
			];
			if (nodes.length === 0) {
				event.preventDefault();
				dialog.focus();
				return;
			}
			const first = nodes[0];
			const last = nodes[nodes.length - 1];
			if (!first || !last) return;
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		dialog.addEventListener("keydown", onKey);
		return () => dialog.removeEventListener("keydown", onKey);
	}, [focus]);

	// The portrait lives in the column. Opening leaves from the card; closing returns to it, even after a scroll.
	useLayoutEffect(() => {
		const slot = slotRef.current;
		if (!slot || shown === null) return;
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		if (focus !== null) {
			const origin = fromRect.current;
			if (!origin || reduced) {
				slot.style.transform = "none";
				return;
			}
			const to = slot.getBoundingClientRect();
			const scale = origin.width / to.width;
			const dx = origin.left + origin.width / 2 - (to.left + to.width / 2);
			const dy = origin.top + origin.height / 2 - (to.top + to.height / 2);
			slot.style.transition = "none";
			slot.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
			slot.getBoundingClientRect();
			const id = requestAnimationFrame(() => {
				slot.style.transition =
					"transform 280ms cubic-bezier(0.77, 0, 0.18, 1)";
				slot.style.transform = "none";
			});
			return () => cancelAnimationFrame(id);
		}

		const portraitEl = portraits.current[shown];
		if (!portraitEl || reduced) {
			finishRef.current();
			return;
		}
		const here = slot.getBoundingClientRect();
		const back = portraitEl.getBoundingClientRect();
		const scale = back.width / here.width;
		const dx = back.left + back.width / 2 - (here.left + here.width / 2);
		const dy = back.top + back.height / 2 - (here.top + here.height / 2);
		slot.style.transition = "transform 200ms cubic-bezier(0.4, 0, 1, 1)";
		slot.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
		let ended = false;
		const done = (event?: Event) => {
			if (
				event instanceof TransitionEvent &&
				event.propertyName !== "transform"
			)
				return;
			if (ended) return;
			ended = true;
			finishRef.current();
		};
		slot.addEventListener("transitionend", done);
		const timer = window.setTimeout(done, 240);
		return () => {
			slot.removeEventListener("transitionend", done);
			window.clearTimeout(timer);
		};
	}, [focus, shown]);

	return (
		<section
			ref={sheetRef}
			aria-label="Team"
			className="team-sheet relative h-full min-h-0 flex flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain"
			data-focus={focus !== null}
			data-open={shown !== null}
		>
			{/* Navbar from PageShell — list is in-flow + scrolls on small viewports (absolute + h-full stacked every card). */}
			<ul
				aria-label="Team members"
				className="team-card-row pointer-events-none relative z-0 w-full"
			>
				{TEAM_MEMBERS.map((person, index) => {
					const sizeLock =
						shown === index ? cardOpenSizeRef.current : null;
					return (
						<li
							key={person.id}
							ref={(node) => {
								cards.current[index] = node;
							}}
							data-selected={shown === index}
							// Lock full card footprint while dialog is open so the grid does not jump (portrait flies via FLIP).
							style={
								sizeLock
									? ({
											width: sizeLock.width,
											minHeight: sizeLock.height,
										} as CSSProperties)
									: undefined
							}
							inert={shown !== null && shown !== index ? true : undefined}
							className="team-card pointer-events-auto relative"
						>
							<div
								ref={(node) => {
									portraits.current[index] = node;
								}}
								className="team-card__portrait-shell"
							>
								<div className="team-card__portrait">
									<button
										type="button"
										ref={(node) => {
											triggers.current[index] = node;
										}}
										aria-label={`${person.name}, ${person.role}`}
										aria-expanded={focus === index}
										onClick={() => {
											if (focus !== null) return;
											open(index);
										}}
										className="absolute inset-0 cursor-pointer touch-manipulation outline-none select-none focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.6)]"
									>
										<TeamMemberPortrait member={person} />
									</button>
								</div>
							</div>
							<div
								className="team-card__meta"
								aria-hidden={shown !== null && shown === index ? true : undefined}
							>
								<p className="team-card__name">{person.name}</p>
								<p className="team-card__role">{person.role}</p>
							</div>
						</li>
					);
				})}
			</ul>

			{member ? (
				<div
					ref={dialogRef}
					role="dialog"
					aria-modal="true"
					aria-labelledby={`team-member-${member.id}`}
					tabIndex={-1}
					className="team-under outline-none"
					onClick={handleDismiss}
					onKeyDown={handleBackdropKeyDown}
				>
					<div
						className="team-under-inner flex flex-col items-center"
						style={{ paddingTop: portraitPad }}
					>
						<div className="team-column flex w-full flex-col items-center gap-10 pb-12">
							<div ref={slotRef} className="team-slot">
								<TeamMemberPortrait member={member} />
							</div>
							<TeamMemberCopySkullet>
								<div className="team-copy-in flex w-full flex-col items-center gap-4 text-center text-white">
									<p className="text-[13px] leading-none font-medium tracking-[0.14em] text-white/55 uppercase">
										{member.role}
									</p>
									<h2
										id={`team-member-${member.id}`}
										className="text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-balance text-white"
									>
										{member.name}
									</h2>
									<p className="max-w-xl text-[15px] leading-[1.55] font-normal text-pretty text-white/75">
										{member.bio}
									</p>
								</div>
							</TeamMemberCopySkullet>
						</div>
					</div>
				</div>
			) : null}
		</section>
	);
}
