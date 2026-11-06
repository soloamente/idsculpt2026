"use client";

import { cn } from "@idsculpt26/ui/lib/utils";
import { getLatestScrollY } from "@/lib/scroll-bridge";
import {
	cloneElement,
	isValidElement,
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";

// Measured from permanent.is section.work (desktop). The strip drifts at 64px/s
// when a tile is this wide; narrower tiles scale that speed so the motion stays
// the same fraction of a tile.
const REF_CARD_WIDTH = 786 * (2400 / 1780) + 8;
// Exponential follow. current closes on target with time constant 0.15s
// (their lerpFactor), i.e. 1 - exp(-dt / 0.15).
const LERP_SECONDS = 0.15;
const DRIFT_PX_PER_SECOND = 64;
// A drag moves the strip 2.2 times the pointer travel.
const DRAG_GAIN = 2.2;
// Movement under this many px is a click, not a drag.
const CLICK_SLOP = 6;
// Repeated so the infinite wrap always has a tile to pull in from either side.
const COPIES = 6;
const MOBILE_QUERY = "(max-width: 760px), (hover: none), (pointer: coarse)";

/** Shown next to the pointer on desktop while hovering a project tile (navbar-style pill). */
const PROJECT_HOVER_HINT = "Click to open project";

/** Offset from the hotspot (px); applied on the outer fixed node so inner motion does not shift the anchor. */
const HINT_OFFSET_PX = 14;

/**
 * Resolves the project link under the pointer, including horizontal padding/gaps on
 * `.work-card` where the hit target is the card, not the `<a>` (avoids grab cursor flash).
 */
function resolveProjectLinkUnderPointer(
	clientX: number,
	clientY: number,
	grid: HTMLDivElement,
	list: HTMLDivElement,
): HTMLAnchorElement | null {
	const top = document.elementFromPoint(clientX, clientY);
	if (!top || !grid.contains(top) || !list.contains(top)) return null;

	const direct = top.closest("a.work-carousel-project-link");
	if (direct && grid.contains(direct) && list.contains(direct)) {
		return direct as HTMLAnchorElement;
	}

	const card = top.closest(".work-card");
	if (!card || !list.contains(card)) return null;

	return card.querySelector<HTMLAnchorElement>("a.work-carousel-project-link");
}
// useLayoutEffect on the server warns; the client still applies transforms before paint.
const useIsoLayoutEffect =
	typeof window === "undefined" ? useEffect : useLayoutEffect;

const BLUR_STOPS = [
	{ blur: "1px", start: "0%", end: "20%" },
	{ blur: "2px", start: "20%", end: "40%" },
	{ blur: "4px", start: "40%", end: "60%" },
	{ blur: "8px", start: "60%", end: "80%" },
	{ blur: "16px", start: "80%", end: "96%" },
] as const;

export interface WorkCarouselTile {
	id: string;
	node: ReactNode;
}

interface CarouselEngine {
	step: (direction: 1 | -1) => void;
}

// Shortest signed distance on a loop, so a tile can jump from one end to the other.
function wrapDelta(value: number, length: number) {
	if (length <= 0) return 0;
	let wrapped = value % length;
	if (Math.abs(wrapped) > length / 2) {
		wrapped = wrapped > 0 ? wrapped - length : wrapped + length;
	}
	return wrapped;
}

function ArrowIcon({ direction }: { direction: "prev" | "next" }) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			aria-hidden="true"
		>
			<path
				d={
					direction === "prev"
						? "M3 10H17M10 3L3 10L10 17"
						: "M17 10H3M10 17L17 10L10 3"
				}
				stroke="currentColor"
				strokeOpacity="0.9"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function EdgeBlur({ side }: { side: "prev" | "next" }) {
	return (
		<div
			className={`work-edge-blur work-edge-blur--${side}`}
			aria-hidden="true"
		>
			{BLUR_STOPS.map((stop) => (
				<span
					key={stop.blur}
					style={{
						["--edge-blur" as string]: stop.blur,
						["--blur-start" as string]: stop.start,
						["--blur-end" as string]: stop.end,
					}}
				/>
			))}
		</div>
	);
}

/**
 * Infinite work strip. It drifts until someone drags, clicks a cut-off tile, or
 * uses an arrow; that hands control over, and the strip eases until the chosen
 * tile sits in the centre. A click on the tile already in the centre opens its
 * project. Positions are written to the DOM from one rAF loop.
 */
export function WorkCarousel({
	tiles,
	bleed = false,
}: {
	tiles: WorkCarouselTile[];
	// Pull the strip 12px past its section, cancelling a 12px page inset.
	bleed?: boolean;
}) {
	const count = tiles.length;
	const gridRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
	const engineRef = useRef<CarouselEngine | null>(null);
	const hintNodeRef = useRef<HTMLDivElement>(null);
	const hintTargetRef = useRef({ x: 0, y: 0 });
	const hintDrawnRef = useRef({ x: 0, y: 0 });
	const hintVisibleRef = useRef(false);
	const [hintVisible, setHintVisible] = useState(false);

	const updateProjectHoverHint = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const grid = gridRef.current;
			const list = listRef.current;
			if (!grid || !list) return;
			// Touch / narrow layout: native scrolling and no faux cursor label.
			if (window.matchMedia(MOBILE_QUERY).matches) {
				if (hintVisibleRef.current) {
					hintVisibleRef.current = false;
					setHintVisible(false);
				}
				return;
			}
			// While dragging the strip, hide the hint so it does not fight grab feedback.
			if (list.dataset.dragging === "true") {
				if (hintVisibleRef.current) {
					hintVisibleRef.current = false;
					setHintVisible(false);
				}
				return;
			}
			const link = resolveProjectLinkUnderPointer(
				event.clientX,
				event.clientY,
				grid,
				list,
			);
			hintTargetRef.current = { x: event.clientX, y: event.clientY };
			if (!link) {
				if (hintVisibleRef.current) {
					hintVisibleRef.current = false;
					setHintVisible(false);
				}
				return;
			}
			// Appear on the pointer, then lag behind it.
			if (!hintVisibleRef.current) {
				hintDrawnRef.current = { x: event.clientX, y: event.clientY };
				hintVisibleRef.current = true;
				setHintVisible(true);
			}
		},
		[],
	);

	const hideProjectHoverHint = useCallback(() => {
		if (!hintVisibleRef.current) return;
		hintVisibleRef.current = false;
		setHintVisible(false);
	}, []);

	// The system cursor stays instant. The label eases toward it.
	useEffect(() => {
		let raf = 0;
		const follow = () => {
			const node = hintNodeRef.current;
			if (node && hintVisibleRef.current) {
				const target = hintTargetRef.current;
				const drawn = hintDrawnRef.current;
				drawn.x += (target.x - drawn.x) * 0.18;
				drawn.y += (target.y - drawn.y) * 0.18;
				node.style.transform = `translate3d(${drawn.x + HINT_OFFSET_PX}px, ${drawn.y + HINT_OFFSET_PX}px, 0)`;
			}
			raf = requestAnimationFrame(follow);
		};
		raf = requestAnimationFrame(follow);
		return () => cancelAnimationFrame(raf);
	}, []);

	useIsoLayoutEffect(() => {
		const list = listRef.current;
		const grid = gridRef.current;
		if (!list || !grid || count === 0) return;

		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const mobile = window.matchMedia(MOBILE_QUERY);
		const cards = () =>
			cardRefs.current.filter(
				(card): card is HTMLDivElement =>
					card !== null && card.offsetParent !== null,
			);

		let widths: number[] = [];
		let offsets: number[] = [];
		let total = 0;
		let wrapperWidth = 0;
		let scale = 1;
		// Shifted a quarter tile to the right on first layout, matching the reference's opening frame.
		let placed = false;
		let current = 0;
		let target = 0;
		let boost = 0;
		let lastScrollY = getLatestScrollY();
		let dragging = false;
		let interacted = false;
		let visible = false;
		let startX = 0;
		let lastX = 0;
		let moved = 0;
		let startIndex = 0;
		let dragOrigin = 0;
		let touchAxis: "horizontal" | "vertical" | null = null;
		let touchStartX = 0;
		let touchStartY = 0;
		let raf = 0;
		let lastFrameAt = 0;
		/** Finger is down on the native (mobile) scroller. */
		let mobileHold = false;
		/** Don't resume the self-driven drift until after this timestamp. */
		let resumeAt = 0;
		/** Scroll events still owed to the drift, not the user. */
		let writingScroll = 0;

		const measure = () => {
			const visibleCards = cards();
			widths = visibleCards.map((card) => card.offsetWidth);
			offsets = visibleCards.map((card) => card.offsetLeft);
			const last = widths.length - 1;
			total = last >= 0 ? offsets[last] + widths[last] : 0;
			wrapperWidth = list.clientWidth;
			scale = widths[0] > 0 ? widths[0] / REF_CARD_WIDTH : 1;
		};

		// Translate that puts card `index` in the centre, on the loop closest to `near`.
		const positionFor = (index: number, near: number) => {
			const center = offsets[index] + widths[index] / 2;
			let desired = -(center - wrapperWidth / 2);
			if (total > 0) {
				desired += Math.round((near - desired) / total) * total;
			}
			return desired;
		};

		const closestToCenter = () => {
			const visibleCards = cards();
			const mid = list.getBoundingClientRect().left + list.clientWidth / 2;
			let best = 0;
			let bestDistance = Number.POSITIVE_INFINITY;
			for (let i = 0; i < visibleCards.length; i++) {
				const rect = visibleCards[i].getBoundingClientRect();
				const distance = Math.abs(rect.left + rect.width / 2 - mid);
				if (distance < bestDistance) {
					bestDistance = distance;
					best = i;
				}
			}
			return best;
		};

		const render = () => {
			if (mobile.matches || total <= 0) return;
			const visibleCards = cards();
			for (let i = 0; i < visibleCards.length; i++) {
				const delta = wrapDelta(current + offsets[i], total) - offsets[i];
				visibleCards[i].style.transform = `translate3d(${delta}px, 0, 0)`;
			}
		};

		const goTo = (index: number, immediate: boolean) => {
			if (mobile.matches) {
				scrollMobile(index, immediate);
				return;
			}
			const wrapped = ((index % widths.length) + widths.length) % widths.length;
			target = positionFor(wrapped, current);
			if (immediate) {
				current = target;
				render();
			}
		};

		const scrollMobile = (index: number, immediate: boolean) => {
			const visibleCards = cards();
			const card = visibleCards[index];
			if (!card) return;
			const cardRect = card.getBoundingClientRect();
			const listRect = list.getBoundingClientRect();
			const left =
				list.scrollLeft +
				(cardRect.left + cardRect.width / 2) -
				(listRect.left + listRect.width / 2);
			list.scrollTo({ left, behavior: immediate ? "instant" : "smooth" });
			syncMobileArrows(index);
		};

		const syncMobileArrows = (index: number) => {
			const prev = grid.querySelector<HTMLButtonElement>("[data-work-prev]");
			const next = grid.querySelector<HTMLButtonElement>("[data-work-next]");
			if (!prev || !next) return;
			if (!mobile.matches) {
				prev.disabled = false;
				next.disabled = false;
				return;
			}
			const last = cards().length - 1;
			prev.disabled = index <= 0;
			next.disabled = index >= last;
		};

		const tick = (now: number) => {
			const zoomed = (window.visualViewport?.scale ?? 1) > 1.02;
			// Off screen, hidden, or pinch-zoomed: stop the loop until start() is called again.
			if (!visible || document.hidden || zoomed) {
				raf = 0;
				return;
			}
			raf = requestAnimationFrame(tick);
			const dt = Math.min((now - lastFrameAt) / 1000, 0.05);
			lastFrameAt = now;
			if (mobile.matches) {
				driftMobile(dt);
				return;
			}
			const scrollY = getLatestScrollY();
			if (!dragging && !interacted && !reduceMotion.matches) {
				const scrollDelta = scrollY - lastScrollY;
				// Page scroll downward gives the strip a brief extra push, then it decays.
				boost = Math.min(
					7 * scale,
					boost * 0.94 ** (dt * 60) + Math.max(0, scrollDelta) * 0.02 * scale,
				);
				target -= DRIFT_PX_PER_SECOND * scale * dt + boost;
			} else {
				boost = 0;
			}
			lastScrollY = scrollY;
			// Same follow while dragging and while settling on a tile.
			current += (target - current) * (1 - Math.exp(-dt / LERP_SECONDS));
			render();
		};

		// One copy of the tiles, so the second copy can take over without a jump.
		const oneSetWidth = () => {
			const n = Math.min(count, widths.length);
			let width = 0;
			for (let i = 0; i < n; i++) width += widths[i] ?? 0;
			return width;
		};

		// Native scroller on touch: same 64px/s drift as the desktop strip, scaled to the tile.
		const driftMobile = (dt: number) => {
			if (reduceMotion.matches || mobileHold || performance.now() < resumeAt) return;
			const setWidth = oneSetWidth();
			if (setWidth <= 0) return;
			const before = list.scrollLeft;
			let next = before + DRIFT_PX_PER_SECOND * scale * dt;
			if (next >= setWidth) next -= setWidth;
			if (next === before) return;
			writingScroll += 1;
			list.scrollLeft = next;
			if (list.scrollLeft === before) writingScroll = Math.max(0, writingScroll - 1);
		};

		const start = () => {
			if (raf || !visible) return;
			lastFrameAt = performance.now();
			lastScrollY = getLatestScrollY();
			raf = requestAnimationFrame(tick);
		};
		const stop = () => {
			cancelAnimationFrame(raf);
			raf = 0;
		};

		const layout = () => {
			const previousTotal = total;
			measure();
			if (mobile.matches) {
				list.style.paddingInlineStart = "";
				list.style.paddingInlineEnd = "";
				for (const card of cardRefs.current) {
					if (card) card.style.transform = "";
				}
				return;
			}
			list.style.paddingInlineStart = "";
			list.style.paddingInlineEnd = "";
			if (!placed && widths[0] > 0) {
				target = widths[0] * 0.25;
				current = target;
				placed = true;
			} else if (previousTotal > 0 && total > 0) {
				const ratio = total / previousTotal;
				current *= ratio;
				target *= ratio;
			}
			render();
		};

		const stepBy = (direction: 1 | -1) => {
			interacted = true;
			const index = closestToCenter();
			goTo(index + direction, reduceMotion.matches);
		};

		const handlePointerDown = (event: PointerEvent) => {
			if (mobile.matches) {
				mobileHold = true;
				return;
			}
			if (event.pointerType === "mouse" && event.button !== 0) return;
			dragging = true;
			moved = 0;
			touchAxis = null;
			startX = event.clientX;
			lastX = event.clientX;
			touchStartX = event.clientX;
			touchStartY = event.clientY;
			startIndex = closestToCenter();
			dragOrigin = target;
			list.dataset.dragging = "true";
		};

		const handlePointerMove = (event: PointerEvent) => {
			if (!dragging || mobile.matches) {
				return;
			}
			if (event.pointerType === "touch" && touchAxis !== "horizontal") {
				const dx = Math.abs(event.clientX - touchStartX);
				const dy = Math.abs(event.clientY - touchStartY);
				if (dx < 5 && dy < 5) return;
				touchAxis = dx > dy ? "horizontal" : "vertical";
				if (touchAxis === "vertical") {
					dragging = false;
					delete list.dataset.dragging;
					return;
				}
			}
			if (event.pointerType === "touch") event.preventDefault();
			const dx = event.clientX - startX;
			if (Math.abs(dx) > CLICK_SLOP) {
				moved = Math.abs(dx);
				interacted = true;
			}
			// Follow the pointer immediately; the rAF loop eases `current` toward this.
			target = dragOrigin + dx * DRAG_GAIN;
			lastX = event.clientX;
		};

		const handlePointerUp = () => {
			if (mobileHold) {
				mobileHold = false;
				resumeAt = performance.now() + 1400;
				return;
			}
			if (!dragging) return;
			dragging = false;
			delete list.dataset.dragging;
			touchAxis = null;
			if (mobile.matches || moved < CLICK_SLOP) return;
			let index = closestToCenter();
			const drag = lastX - startX;
			// A nudge that never left the current tile still advances one tile.
			if (index === startIndex && Math.abs(drag) > CLICK_SLOP) {
				index = (startIndex - Math.sign(drag) + widths.length) % widths.length;
			}
			// Settle from where the tile actually is, not from the overshot drag target.
			target = current;
			target = positionFor(index, target);
			if (reduceMotion.matches) {
				current = target;
				render();
			}
		};

		const handleClick = (event: MouseEvent) => {
			// A drag should not follow the project link. A cut-off tile comes to centre.
			if (moved >= CLICK_SLOP) {
				event.preventDefault();
				return;
			}
			if (mobile.matches) return;
			const card = (event.target as Element).closest(".work-card");
			if (!card || !list.contains(card)) return;
			const cardRect = card.getBoundingClientRect();
			const listRect = list.getBoundingClientRect();
			if (
				cardRect.left >= listRect.left - 1 &&
				cardRect.right <= listRect.right + 1
			)
				return;
			event.preventDefault();
			const visibleCards = cards();
			const index = visibleCards.indexOf(card as HTMLDivElement);
			if (index < 0) return;
			interacted = true;
			goTo(index, reduceMotion.matches);
		};

		const handleWheel = (event: WheelEvent) => {
			if (mobile.matches || dragging) return;
			if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
			target += -event.deltaX * 0.5 * scale;
		};

		const handleHover = (event: PointerEvent) => {
			if (event.pointerType === "touch" || dragging) {
				delete grid.dataset.hoverEdge;
				return;
			}
			const rect = list.getBoundingClientRect();
			if (event.clientY < rect.top || event.clientY > rect.bottom) {
				delete grid.dataset.hoverEdge;
				return;
			}
			const zone = Math.min(96, rect.width / 4);
			if (event.clientX < rect.left + zone) grid.dataset.hoverEdge = "prev";
			else if (event.clientX > rect.right - zone)
				grid.dataset.hoverEdge = "next";
			else delete grid.dataset.hoverEdge;
		};

		const handleFocusIn = (event: FocusEvent) => {
			if (dragging || mobile.matches) return;
			const card = (event.target as Element).closest?.(".work-card");
			if (!card || !list.contains(card)) return;
			const cardRect = card.getBoundingClientRect();
			const listRect = list.getBoundingClientRect();
			if (
				cardRect.left >= listRect.left - 1 &&
				cardRect.right <= listRect.right + 1
			)
				return;
			const index = cards().indexOf(card as HTMLDivElement);
			if (index < 0) return;
			interacted = true;
			goTo(index, reduceMotion.matches);
		};

		const intersection = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible) start();
		});

		const resize = new ResizeObserver(() => {
			layout();
		});

		const onUserScroll = () => {
			if (writingScroll > 0) {
				writingScroll -= 1;
				return;
			}
			resumeAt = performance.now() + 1600;
		};

		engineRef.current = { step: stepBy };
		const clearHover = () => {
			delete grid.dataset.hoverEdge;
		};
		list.addEventListener("pointerdown", handlePointerDown);
		list.addEventListener("scroll", onUserScroll, { passive: true });
		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
		window.addEventListener("pointercancel", handlePointerUp);
		list.addEventListener("click", handleClick);
		list.addEventListener("wheel", handleWheel, { passive: true });
		list.addEventListener("focusin", handleFocusIn);
		grid.addEventListener("pointermove", handleHover);
		grid.addEventListener("pointerleave", clearHover);
		intersection.observe(list);
		resize.observe(list);
		layout();
		start();

		const onMobileChange = () => layout();
		mobile.addEventListener("change", onMobileChange);

		return () => {
			stop();
			engineRef.current = null;
			list.removeEventListener("pointerdown", handlePointerDown);
			list.removeEventListener("scroll", onUserScroll);
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			window.removeEventListener("pointercancel", handlePointerUp);
			list.removeEventListener("click", handleClick);
			list.removeEventListener("wheel", handleWheel);
			list.removeEventListener("focusin", handleFocusIn);
			grid.removeEventListener("pointermove", handleHover);
			grid.removeEventListener("pointerleave", clearHover);
			intersection.disconnect();
			resize.disconnect();
			mobile.removeEventListener("change", onMobileChange);
		};
	}, [count]);

	return (
		<div
			ref={gridRef}
			className={bleed ? "work-grid work-grid--bleed" : "work-grid"}
			data-smooth-slider=""
			onPointerMove={updateProjectHoverHint}
			onPointerLeave={hideProjectHoverHint}
			onPointerDown={hideProjectHoverHint}
		>
			<section
				ref={listRef}
				aria-roledescription="carousel"
				aria-label="Selected work"
				className="work-grid__list"
			>
				{Array.from({ length: count * COPIES }, (_, i) => {
					const tile = tiles[i % count];
					const copy = Math.floor(i / count);
					return (
						<div
							key={`${tile.id}-${copy}`}
							ref={(element) => {
								cardRefs.current[i] = element;
								// Duplicate copies stay out of the tab order. The visible copy keeps the link.
								if (!element || copy === 0) return;
								for (const anchor of element.querySelectorAll("a")) {
									anchor.tabIndex = -1;
								}
							}}
							data-copy={copy}
							aria-hidden={copy > 0 ? true : undefined}
							className="work-card"
						>
							<div className="work-card-inner">
								{/* A fresh element per copy, so each tile waits on its own images. */}
								{isValidElement(tile.node)
									? cloneElement(tile.node)
									: tile.node}
							</div>
						</div>
					);
				})}
			</section>
			<nav className="work-edge-nav" aria-label="Work navigation">
				<EdgeBlur side="prev" />
				<EdgeBlur side="next" />
				<button
					type="button"
					data-work-prev=""
					aria-label="Previous work"
					onClick={() => engineRef.current?.step(-1)}
					className="work-edge-arrow"
				>
					<ArrowIcon direction="prev" />
				</button>
				<button
					type="button"
					data-work-next=""
					aria-label="Next work"
					onClick={() => engineRef.current?.step(1)}
					className="work-edge-arrow"
				>
					<ArrowIcon direction="next" />
				</button>
			</nav>

			{/*
			 * Always mounted so enter/exit can transition (opacity + transform only).
			 * Fixed positioning avoids clipping by overflow:hidden on tiles.
			 */}
			<div
				ref={hintNodeRef}
				className={cn(
					"work-carousel-hover-hint pointer-events-none select-none",
					hintVisible && "work-carousel-hover-hint--visible",
				)}
				aria-hidden={!hintVisible}
			>
				{/*
				 * Shell + label: shell does a horizontal "unfold" from the hotspot; the label
				 * follows with a short delay (CSS) so it feels like two beats, not one opacity fade.
				 */}
				<span className="work-carousel-hover-hint__shell">
					<span className="work-carousel-hover-hint__label">
						{PROJECT_HOVER_HINT}
					</span>
				</span>
			</div>
		</div>
	);
}
