/** Timers for in-flight soft swaps (transitions.dev text-swap-soft). */
const softSwapTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

function readDurationMs(token: string, fallback: number): number {
	const raw = getComputedStyle(document.documentElement)
		.getPropertyValue(token)
		.trim();
	const value = Number.parseFloat(raw);
	if (!Number.isFinite(value)) return fallback;
	// Computed custom properties come back as seconds ("0.2s"), not "200ms".
	if (raw.endsWith("ms")) return value;
	if (raw.endsWith("s")) return value * 1000;
	return value;
}

/**
 * Cross-blur label swap with width ease (transitions.dev `34-text-swap-soft`).
 * Scale is applied via `.t-text-soft` / `--text-soft-scale` in `index.css`.
 */
export function softSwapText(el: HTMLElement, next: string): void {
	const prev = el.dataset.text ?? el.textContent ?? "";
	if (prev === next) return;

	el.dataset.text = next;

	const existingTimer = softSwapTimers.get(el);
	if (existingTimer) clearTimeout(existingTimer);

	const prefersReduced =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	if (prefersReduced) {
		el.classList.remove("is-swapping");
		el.style.removeProperty("width");
		el.textContent = next;
		return;
	}

	const out = document.createElement("span");
	out.className = "t-text-soft-old";
	out.setAttribute("aria-hidden", "true");
	out.textContent = prev;

	const inn = document.createElement("span");
	inn.className = "t-text-soft-new";
	inn.textContent = next;

	// React commits an empty span before this runs, so put the previous
	// label back long enough to measure its width. Otherwise the cross-blur
	// starts from 0 and the new title just pops in.
	if ((el.textContent ?? "") !== prev) {
		el.textContent = prev;
	}
	// offsetWidth ignores the scale() on the incoming text. getBoundingClientRect
	// includes that 0.96 scale, which left the pill ~4px short on the right.
	const widthBefore = el.offsetWidth;
	el.classList.remove("is-swapping");
	el.replaceChildren(out, inn);

	const widthAfter = inn.offsetWidth;
	el.style.width = `${widthBefore}px`;
	void el.offsetWidth;
	el.classList.add("is-swapping");
	el.style.width = `${widthAfter}px`;

	const settleMs =
		Math.max(
			readDurationMs("--text-soft-dur", 200),
			readDurationMs("--text-soft-resize-dur", 240),
		) + 40;

	const timer = setTimeout(() => {
		el.classList.remove("is-swapping");
		el.style.removeProperty("width");
		el.textContent = next;
		softSwapTimers.delete(el);
	}, settleMs);

	softSwapTimers.set(el, timer);
}
