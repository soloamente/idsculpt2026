/**
 * Single source for “current vertical scroll” when Lenis is active: native `scrollY`
 * can lag behind Lenis’s animated value, so Providers writes the live value here and
 * dispatches `app-scroll` for subscribers (carousel drift, next-project dock, etc.).
 */
let latestScrollY = 0;

export function setLatestScrollY(y: number): void {
	latestScrollY = y;
}

export function getLatestScrollY(): number {
	return latestScrollY;
}
