"use client";

import { cn } from "@idsculpt/ui/lib/utils";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type KeyboardEvent,
} from "react";

import type { CaseStudySection } from "@/data/case-studies";
import { softSwapText } from "@/lib/transitions-text-soft-swap";

/** Header clearance when jumping to a section anchor. */
const SECTION_SCROLL_MARGIN_PX = 96;

const SECTION_NAV_OPEN_WIDTH_PX = 324;

/** Glass shell — always hugs the white card inside (no JS width on this layer). */
const SECTION_NAV_SHELL_CLASS =
	"inline-block w-fit rounded-[32px] border border-white/[0.13] bg-gradient-to-b from-white/[0.56] to-[#e5e5e5]/[0.56] p-1 backdrop-blur-[7.2px] shadow-[0_8px_43px_rgba(116,105,85,0.25)]";

const TEXT_SOFT_CLASS =
	"t-text-soft font-bold text-[#4d4d4d] text-sm uppercase leading-none";

function readCssDurationMs(token: string, fallback: number): number {
	const raw = getComputedStyle(document.documentElement)
		.getPropertyValue(token)
		.trim();
	const value = Number.parseFloat(raw);
	if (!Number.isFinite(value)) return fallback;
	// Computed custom properties come back as seconds ("0.25s"), not "250ms".
	if (raw.endsWith("ms")) return value;
	if (raw.endsWith("s")) return value * 1000;
	return value;
}

/**
 * transitions.dev text-swap-soft — React must not control `children` or it
 * overwrites the cross-blur spans on every render.
 */
function useSoftSwapText(
	ref: React.RefObject<HTMLElement | null>,
	text: string,
) {
	const hasMountedRef = useRef(false);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;

		if (!hasMountedRef.current) {
			hasMountedRef.current = true;
			el.dataset.text = text;
			el.textContent = text;
			return;
		}

		softSwapText(el, text);
	}, [ref, text]);
}

/** Section title — single instance so scroll swaps animate while open or closed. */
function SectionNavLabel({ label }: { label: string }) {
	const labelRef = useRef<HTMLSpanElement>(null);
	useSoftSwapText(labelRef, label);

	return (
		<span
			ref={labelRef}
			className={cn(TEXT_SOFT_CLASS, "t-case-study-nav-label")}
		/>
	);
}

/** Panel description — same soft swap when the active section changes. */
function SectionNavDescription({ text }: { text: string }) {
	const descRef = useRef<HTMLParagraphElement>(null);
	useSoftSwapText(descRef, text);

	return (
		<p
			ref={descRef}
			className={cn(
				"t-text-soft min-w-0 font-medium text-[#6b6b6b] text-[11px] leading-normal",
				text ? "min-h-[1lh]" : "m-0 h-0 overflow-hidden opacity-0",
			)}
		/>
	);
}

interface CaseStudySectionNavProps {
	sections: CaseStudySection[];
}

/** 16×16 chevron (Figma pixelarticons:chevron-up). */
function SectionNavChevron({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden
			className={cn("size-4 shrink-0 text-[#4d4d4d]", className)}
			viewBox="0 0 16 16"
			fill="none"
		>
			<path
				d="M4 11L8 6.5L12 11"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="square"
			/>
		</svg>
	);
}

/** Figma close control — 8px square rotated 45° (#c37d7d). */
function SectionNavCloseIcon() {
	return (
		<span aria-hidden className="block size-2 rotate-45 bg-[#c37d7d]" />
	);
}

/**
 * Figma 449:139 — glass shell wraps one card: `.t-resize` width pill↔panel,
 * `.t-acc` grid height for the body (transitions.dev).
 */
export function CaseStudySectionNav({ sections }: CaseStudySectionNavProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const menuOpenRef = useRef(false);
	const sizeTimerRef = useRef<number | null>(null);
	const prevActiveIdRef = useRef<string>("");
	const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
	const [menuOpen, setMenuOpen] = useState(false);

	const activeIndex = sections.findIndex((section) => section.id === activeId);
	const activeSection =
		sections.find((section) => section.id === activeId) ?? sections[0];
	const canExpand = Boolean(activeSection?.navDescription?.trim());

	const prefersReducedMotion = useCallback(() => {
		return (
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		);
	}, []);

	const clearSizeTimer = useCallback(() => {
		if (sizeTimerRef.current != null) {
			window.clearTimeout(sizeTimerRef.current);
			sizeTimerRef.current = null;
		}
	}, []);

	const releasePinnedHeight = useCallback((card: HTMLElement) => {
		card.style.removeProperty("height");
		card.style.removeProperty("overflow");
	}, []);

	/**
	 * Closed pill width = header padding + title + dot slot.
	 * Uses the title's target width (already set by text-swap-soft) so the
	 * card eases to the same place the letters are easing to.
	 */
	const measureClosedContentWidth = useCallback(
		(card: HTMLElement) => {
			const header = card.querySelector<HTMLElement>(
				"[data-section-nav-header]",
			);
			const label = card.querySelector<HTMLElement>(".t-case-study-nav-label");
			if (!header || !label) {
				return Math.ceil(card.getBoundingClientRect().width);
			}

			const styles = getComputedStyle(header);
			const padX =
				Number.parseFloat(styles.paddingLeft) +
				Number.parseFloat(styles.paddingRight);
			const pinned = Number.parseFloat(label.style.width);
			const labelWidth =
				label.classList.contains("is-swapping") && Number.isFinite(pinned)
					? pinned
					: label.offsetWidth;
			const dotSlot = canExpand ? 16 + 8 : 0;
			return Math.ceil(padX + labelWidth + dotSlot);
		},
		[canExpand],
	);

	/** Card resize — one width tween from the current used width to `toWidth`. */
	const tweenCardWidth = useCallback(
		(card: HTMLElement, toWidth: number) => {
			const fromWidth = card.getBoundingClientRect().width;
			const hasPinnedWidth = card.style.width.endsWith("px");
			if (
				prefersReducedMotion() ||
				!hasPinnedWidth ||
				Math.abs(fromWidth - toWidth) < 1
			) {
				card.style.transition = "none";
				card.style.width = `${toWidth}px`;
				void card.offsetWidth;
				card.style.removeProperty("transition");
				return;
			}

			card.style.transition = "none";
			card.style.width = `${fromWidth}px`;
			void card.offsetWidth;
			card.style.removeProperty("transition");
			card.style.width = `${toWidth}px`;
		},
		[prefersReducedMotion],
	);

	/** Card resize — tween height when open panel content changes (new section). */
	const animateOpenCardHeight = useCallback(() => {
		const card = cardRef.current;
		if (!card || prefersReducedMotion()) return;

		clearSizeTimer();
		const heightBefore = card.getBoundingClientRect().height;
		card.style.height = "auto";
		card.style.overflow = "hidden";
		void card.offsetHeight;
		const heightAfter = Math.ceil(card.getBoundingClientRect().height);

		if (Math.abs(heightBefore - heightAfter) < 1) {
			releasePinnedHeight(card);
			return;
		}

		card.style.height = `${heightBefore}px`;
		void card.offsetHeight;
		card.style.height = `${heightAfter}px`;

		const settleMs = readCssDurationMs("--duration-fast", 250) + 40;
		sizeTimerRef.current = window.setTimeout(() => {
			sizeTimerRef.current = null;
			if (cardRef.current !== card || !menuOpenRef.current) return;
			releasePinnedHeight(card);
		}, settleMs);
	}, [clearSizeTimer, prefersReducedMotion, releasePinnedHeight]);

	// Open → fixed card width. Closed → ease width with the title (and the dot slot).
	useLayoutEffect(() => {
		const card = cardRef.current;
		if (!card) return;
		const wasOpen = menuOpenRef.current;
		menuOpenRef.current = menuOpen;
		clearSizeTimer();

		if (menuOpen) {
			releasePinnedHeight(card);
			const openWidth = Math.min(
				SECTION_NAV_OPEN_WIDTH_PX,
				Math.ceil(window.innerWidth - 32),
			);
			tweenCardWidth(card, openWidth);
			return;
		}

		tweenCardWidth(card, measureClosedContentWidth(card));

		if (!wasOpen) return;

		const fromHeight = card.getBoundingClientRect().height;
		const header = card.querySelector<HTMLElement>("[data-section-nav-header]");
		const toHeight = header
			? Math.ceil(header.getBoundingClientRect().height)
			: fromHeight;
		if (prefersReducedMotion() || Math.abs(fromHeight - toHeight) < 1) {
			releasePinnedHeight(card);
			return;
		}

		card.style.height = `${fromHeight}px`;
		card.style.overflow = "hidden";
		void card.offsetWidth;
		card.style.height = `${toHeight}px`;

		const settleMs = readCssDurationMs("--duration-fast", 250) + 40;
		sizeTimerRef.current = window.setTimeout(() => {
			sizeTimerRef.current = null;
			if (cardRef.current !== card || menuOpenRef.current) return;
			releasePinnedHeight(card);
		}, settleMs);
	}, [
		menuOpen,
		activeSection?.navLabel,
		canExpand,
		clearSizeTimer,
		measureClosedContentWidth,
		tweenCardWidth,
		prefersReducedMotion,
		releasePinnedHeight,
	]);

	// A section with no description has nothing to open.
	useEffect(() => {
		if (!canExpand) setMenuOpen(false);
	}, [canExpand]);

	// Panel height resize when the section changes while the card is open.
	useLayoutEffect(() => {
		if (!menuOpen) {
			prevActiveIdRef.current = activeId;
			return;
		}

		if (prevActiveIdRef.current === activeId) return;
		prevActiveIdRef.current = activeId;
		// Let soft-swap DOM + layout settle before height tween.
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				animateOpenCardHeight();
			});
		});
	}, [activeId, menuOpen, animateOpenCardHeight]);

	// Highlight whichever section block occupies the most viewport area.
	useEffect(() => {
		if (sections.length === 0) return;

		const visibilityById = new Map<string, number>();

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = entry.target.id;
					if (!id) continue;
					visibilityById.set(id, entry.intersectionRatio);
				}

				let bestId = sections[0]?.id ?? "";
				let bestRatio = -1;
				for (const section of sections) {
					const ratio = visibilityById.get(section.id) ?? 0;
					if (ratio > bestRatio) {
						bestRatio = ratio;
						bestId = section.id;
					}
				}
				if (bestRatio > 0) {
					setActiveId(bestId);
				}
			},
			{
				root: null,
				rootMargin: "-20% 0px -35% 0px",
				threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
			},
		);

		for (const section of sections) {
			const node = document.getElementById(section.id);
			if (node) observer.observe(node);
		}

		return () => observer.disconnect();
	}, [sections]);

	const handleClose = useCallback(() => {
		setMenuOpen(false);
	}, []);

	const handleOpen = useCallback(() => {
		if (!canExpand) return;
		setMenuOpen(true);
	}, [canExpand]);

	const handleClosedKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				handleOpen();
			}
		},
		[handleOpen],
	);

	// Close the card when clicking outside or pressing Escape.
	useEffect(() => {
		if (!menuOpen) return;

		const onPointerDown = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				handleClose();
			}
		};
		const onKeyDown = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") handleClose();
		};

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [menuOpen, handleClose]);

	const scrollToSection = useCallback((sectionId: string) => {
		const node = document.getElementById(sectionId);
		if (!node) return;

		setActiveId(sectionId);

		const prefersReduced =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		node.scrollIntoView({
			behavior: prefersReduced ? "auto" : "smooth",
			block: "start",
		});
	}, []);

	const handleStep = (direction: -1 | 1) => {
		const nextIndex = activeIndex + direction;
		const target = sections[nextIndex];
		if (!target) return;
		scrollToSection(target.id);
	};

	if (!activeSection || sections.length === 0) {
		return null;
	}

	const canStepUp = activeIndex > 0;
	const canStepDown = activeIndex >= 0 && activeIndex < sections.length - 1;
	const descriptionText = activeSection.navDescription ?? "";

	return (
		<div
			ref={rootRef}
			className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 md:bottom-8"
		>
			<div className={cn(SECTION_NAV_SHELL_CLASS, "pointer-events-auto")}>
				<div
					ref={cardRef}
					data-has-description={canExpand ? "true" : "false"}
					data-open={menuOpen ? "true" : "false"}
					className={cn(
						"t-acc t-case-study-section-nav-card t-resize bg-white",
						menuOpen ? "rounded-[28px]" : "rounded-[40px]",
					)}
				>
					<div
						data-section-nav-header
						className={cn(
							"flex min-h-12 items-center px-5",
							menuOpen && "justify-between gap-4",
							!menuOpen &&
								canExpand &&
								"t-case-study-section-nav-trigger cursor-pointer select-none",
						)}
						{...(menuOpen || !canExpand
							? {}
							: {
									role: "button" as const,
									tabIndex: 0,
									"aria-expanded": false,
									"aria-label": `Section: ${activeSection.navLabel}. Open section panel.`,
									onClick: handleOpen,
									onKeyDown: handleClosedKeyDown,
								})}
					>
						<SectionNavLabel label={activeSection.navLabel} />
						{menuOpen ? (
							<button
								type="button"
								data-section-nav-trail
								className="flex size-12 shrink-0 items-center justify-center rounded-full transition-opacity duration-150 ease-out hover:opacity-70"
								aria-label="Close section panel"
								aria-expanded
								onMouseDown={(event) => event.preventDefault()}
								onClick={handleClose}
							>
								<SectionNavCloseIcon />
							</button>
						) : (
							<span
								aria-hidden
								data-section-nav-trail
								className="t-case-study-section-nav-dot shrink-0 bg-[#4d4d4d]"
							/>
						)}
					</div>

					<div className="t-acc-panel">
						<div className="t-acc-panel-inner">
							<div className="flex flex-col gap-4 px-5 pb-2">
							<SectionNavDescription text={descriptionText} />
							<div className="flex items-start">
								<button
									type="button"
									disabled={!canStepUp}
									className="flex size-12 items-center justify-center transition-opacity duration-150 ease-out enabled:hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-25"
									aria-label="Previous section"
									onMouseDown={(event) => event.preventDefault()}
									onClick={() => handleStep(-1)}
								>
									<SectionNavChevron />
								</button>
								<button
									type="button"
									disabled={!canStepDown}
									className="flex size-12 items-center justify-center transition-opacity duration-150 ease-out enabled:hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-25"
									aria-label="Next section"
									onMouseDown={(event) => event.preventDefault()}
									onClick={() => handleStep(1)}
								>
									<SectionNavChevron className="rotate-180" />
								</button>
							</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/** DOM id + scroll margin for in-page section targets. */
export function caseStudySectionAnchorProps(section: CaseStudySection) {
	return {
		id: section.id,
		style: { scrollMarginTop: SECTION_SCROLL_MARGIN_PX },
	} as const;
}
