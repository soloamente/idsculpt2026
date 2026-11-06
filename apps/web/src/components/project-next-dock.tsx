"use client";

import { cn } from "@idsculpt26/ui/lib/utils";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import {
	getNextProject,
	type ProjectSlug,
	WORK_PROJECT_PATHS,
} from "@/components/projects";
import { getLatestScrollY } from "@/lib/scroll-bridge";

/** Subpixel / rounding slack — open when scroll is effectively at the scroll container bottom. */
const BOTTOM_THRESHOLD_PX = 24;

interface ProjectNextDockProps {
	currentSlug: ProjectSlug;
}

/**
 * Fixed bottom sheet (navbar-black) that opens only when the document is scrolled to
 * the real bottom (`scrollHeight - viewport`), then slides up with transform (smooth;
 * avoids max-height 0→100dvh which eases wrong vs content height).
 */
export function ProjectNextDock({ currentSlug }: ProjectNextDockProps) {
	const next = getNextProject(currentSlug);
	const href = WORK_PROJECT_PATHS[next.slug];
	const sentinelRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLElement | null>(null);
	const [open, setOpen] = useState(false);
	const dismissedUntilLeaveRef = useRef(false);
	const rafRef = useRef<number | null>(null);
	// A tap at the bottom of a phone shows the browser chrome and nudges the
	// scroll. That used to close the sheet (and set it inert) before the click
	// landed, so the rise never started. Hold the sheet open across the tap.
	const pointerHoldingRef = useRef(false);
	const pointerHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);
	const scheduleTickRef = useRef<() => void>(() => {});
	const titleId = useId();

	useEffect(() => {
		/**
		 * Distance to layout bottom in the viewport scroll container.
		 * Uses `window` metrics — scroll events do not bubble to `document`, so capture listeners there
		 * miss viewport scroll; `window` + IntersectionObserver cover the real case.
		 */
		function distanceFromScrollBottom(): number {
			// `getLatestScrollY` stays in sync when Lenis drives scroll (Providers updates it each frame).
			const scrollTop =
				getLatestScrollY() ||
				window.scrollY ||
				document.documentElement.scrollTop ||
				document.body.scrollTop ||
				0;
			const viewport = window.innerHeight;
			const scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body.scrollHeight,
			);
			return scrollHeight - scrollTop - viewport;
		}

		function isAtScrollBottom(): boolean {
			return distanceFromScrollBottom() <= BOTTOM_THRESHOLD_PX;
		}

		function applyOpenState(atBottom: boolean) {
			if (document.documentElement.hasAttribute("data-view-transition")) return;
			if (pointerHoldingRef.current) {
				setOpen(true);
				return;
			}
			if (!atBottom) {
				dismissedUntilLeaveRef.current = false;
				setOpen(false);
				return;
			}
			if (!dismissedUntilLeaveRef.current) {
				setOpen(true);
			}
		}

		function tick() {
			rafRef.current = null;
			applyOpenState(isAtScrollBottom());
		}

		function scheduleTick() {
			// A scroll-to-top during the page rise must not close the sheet and
			// re-render the outgoing page — iOS drops the transition when it does.
			if (document.documentElement.hasAttribute("data-view-transition")) return;
			if (rafRef.current != null) return;
			rafRef.current = requestAnimationFrame(tick);
		}

		scheduleTickRef.current = scheduleTick;

		const node = sentinelRef.current;
		// Primary: IO fires when the sentinel enters/leaves the viewport (no dependency on scroll events).
		let observer: IntersectionObserver | null = null;
		if (node && typeof IntersectionObserver !== "undefined") {
			observer = new IntersectionObserver(
				(entries) => {
					const hit = entries.some((e) => e.isIntersecting);
					applyOpenState(hit);
				},
				{ root: null, threshold: 0, rootMargin: "0px" },
			);
			observer.observe(node);
		}

		// Fallback when IO is unavailable + sync after resize / font / image layout.
		scheduleTick();
		window.addEventListener("scroll", scheduleTick, { passive: true });
		window.addEventListener("app-scroll", scheduleTick, { passive: true });
		window.addEventListener("resize", scheduleTick, { passive: true });

		const ro =
			typeof ResizeObserver !== "undefined"
				? new ResizeObserver(() => scheduleTick())
				: null;
		if (ro) {
			if (node) ro.observe(node);
			ro.observe(document.documentElement);
		}

		return () => {
			observer?.disconnect();
			window.removeEventListener("scroll", scheduleTick);
			window.removeEventListener("app-scroll", scheduleTick);
			window.removeEventListener("resize", scheduleTick);
			if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
			if (pointerHoldTimerRef.current != null) {
				clearTimeout(pointerHoldTimerRef.current);
			}
			ro?.disconnect();
		};
	}, [currentSlug]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			e.preventDefault();
			dismissedUntilLeaveRef.current = true;
			setOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	useEffect(() => {
		if (!open) return;
		// Entire dock panel is one link — focus it for keyboard users when the sheet opens.
		panelRef.current
			?.querySelector<HTMLAnchorElement>("a.project-next-dock__panel")
			?.focus({
				preventScroll: true,
			});
	}, [open]);

	return (
		<>
			{/* Last marker in document flow: intersects viewport only near the true page end (IO + fallback). */}
			<div
				ref={sentinelRef}
				className="project-next-sentinel"
				aria-hidden={true}
			/>

			<section
				ref={panelRef}
				aria-labelledby={titleId}
				data-open={open}
				className={cn("project-next-dock", open && "project-next-dock--open")}
				// When closed the sheet is off-screen; keep links out of the tab order until opened.
				inert={!open}
			>
				{/* Horizontal inset matches previous dock; panel uses transform for motion. */}
				<div className="project-next-dock__sheet">
					{/* Whole card is the control — click anywhere to go to the next case study. */}
					<Link
						href={href}
						transitionTypes={["page-rise"]}
						// A drag on this card must not become a scroll. On a phone
						// that scroll cancels the click, so the rise never starts.
						className={cn(
							"project-next-dock__panel block touch-none bg-black px-6 pt-10 pb-8 text-white no-underline outline-none",
							"focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
						)}
						aria-describedby={`${titleId}-hint`}
						onPointerDown={(event) => {
							pointerHoldingRef.current = true;
							if (pointerHoldTimerRef.current != null) {
								clearTimeout(pointerHoldTimerRef.current);
								pointerHoldTimerRef.current = null;
							}
							// Keep the gesture if the browser chrome shifts the card
							// out from under the finger before pointerup.
							try {
								event.currentTarget.setPointerCapture(event.pointerId);
							} catch {
								// The pointer can already be gone. The click still lands.
							}
						}}
						onPointerUp={() => {
							pointerHoldTimerRef.current = setTimeout(() => {
								pointerHoldingRef.current = false;
								pointerHoldTimerRef.current = null;
								scheduleTickRef.current();
							}, 700);
						}}
						onPointerCancel={() => {
							pointerHoldingRef.current = false;
							scheduleTickRef.current();
						}}
					>
						<p
							id={titleId}
							className="project-next-dock__brand m-0 text-white uppercase"
						>
							{next.brand}
						</p>

						<p
							id={`${titleId}-hint`}
							className="project-next-dock__hint m-0 mt-8 text-center text-[15px] leading-snug font-medium text-white/65 md:text-base"
						>
							Click for the next project
						</p>
					</Link>
				</div>
			</section>
		</>
	);
}
