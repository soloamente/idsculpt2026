import { resolveFamily } from "./font-utils";
import { renderSticker } from "./sticker-render";
import { STICKERS, type StickerDef } from "./stickers";

const FRICTION = 0.92;
const BOUNCE = 0.55;
const MIN_VEL = 0.05;
const THROW_SCALE = 0.7;
const GRAB_SCALE = 1.08;
const SCALE_EASE = 0.14;
const DRAG_EASE = 0.14;
const ROT_FRICTION = 0.9;
const LIFT_EASE = 0.2;
/** How far the sticker floats up (px) when collected. */
const LIFT_RISE_PX = 16;
/** Peel tilt while lifted — reads as vinyl bending off the page. */
const LIFT_PEEL_DEG = 24;

const APPEAR_EASE = 0.09;
const APPEAR_STAGGER_MS = 140;

const TAP_MOVE_PX = 6;
const WOBBLE_DEG = 9;
const WOBBLE_DECAY = 0.88;

interface Item {
	def: StickerDef;
	art: HTMLCanvasElement;
	hit: HTMLDivElement;
	w: number;
	h: number;
	x: number;
	y: number;
	tx: number;
	ty: number;
	vx: number;
	vy: number;
	rot: number;
	vRot: number;
	wobble: number;
	scale: number;
	/** 0 = flat on page, 1 = picked up (shadow + peel). */
	lift: number;
	grabU: number;
	grabV: number;
	dragging: boolean;
	appear: number;
	appearAt: number;
}

export class WordStickers {
	private host: HTMLElement;
	private items: Item[] = [];
	private W = 1;
	private H = 1;
	private raf = 0;
	private running = false;
	private disposed = false;
	private laidOut = false;
	private entranceStarted = false;
	private now = 0;

	private drag: {
		item: Item;
		dx: number;
		dy: number;
		lastX: number;
		lastY: number;
		moved: number;
		pointerId: number;
	} | null = null;

	private ro?: ResizeObserver;
	private cleanup: (() => void)[] = [];

	constructor(host: HTMLElement) {
		this.host = host;
		this.host.style.perspective = "900px";
		this.measure();

		for (const def of STICKERS) {
			const fontSizePx = this.stickerFontPx();
			const r = renderSticker({
				word: def.word,
				font: resolveFamily(def.font),
				weight: def.weight,
				fill: def.fill,
				outline: def.outline,
				fontSizePx,
			});

			const art = r.canvas;
			Object.assign(art.style, {
				position: "absolute",
				width: `${r.width}px`,
				height: `${r.height}px`,
				left: "0",
				top: "0",
				pointerEvents: "none",
			});
			art.setAttribute("aria-hidden", "true");
			host.appendChild(art);

			const hit = document.createElement("div");
			Object.assign(hit.style, {
				position: "absolute",
				left: "0",
				top: "0",
				width: `${r.width}px`,
				height: `${r.height}px`,
				cursor: "grab",
				touchAction: "none",
				// Host is pointer-events-none so page text stays scrollable; hits re-enable drag.
				pointerEvents: "auto",
			});
			hit.setAttribute("aria-hidden", "true");
			host.appendChild(hit);

			const item: Item = {
				def,
				art,
				hit,
				w: r.width,
				h: r.height,
				x: def.x * this.W - r.width / 2,
				y: def.y * this.H - r.height / 2,
				tx: 0,
				ty: 0,
				vx: 0,
				vy: 0,
				rot: def.rot,
				vRot: 0,
				wobble: 0,
				scale: 1,
				lift: 0,
				grabU: 0.5,
				grabV: 0.5,
				dragging: false,
				appear: 0,
				appearAt: 0,
			};
			item.tx = item.x;
			item.ty = item.y;
			this.clampInside(item);
			this.placeItem(item);
			this.items.push(item);
			this.bindDrag(item);
		}

		this.ro = new ResizeObserver(() => this.onResize());
		this.ro.observe(host);
	}

	private measure() {
		this.W = this.host.clientWidth || 1;
		this.H = this.host.clientHeight || 1;
	}

	private stickerFontPx() {
		const w = this.W > 40 ? this.W : 640;
		return Math.max(32, Math.min(66, w * 0.088));
	}

	private onResize() {
		const prevW = this.W;
		const prevH = this.H;
		this.measure();
		if (this.W < 2 || this.H < 2) return;
		const sx = this.W / (prevW || 1);
		const sy = this.H / (prevH || 1);
		for (const it of this.items) {
			it.x *= sx;
			it.y *= sy;
			it.tx = it.x;
			it.ty = it.y;
		}
		this.rerenderAll();
	}

	private effScale(it: Item) {
		const a = it.appearAt > 0 ? it.appear : 1;
		return it.scale * a;
	}

	private placeItem(it: Item) {
		const s = this.effScale(it);
		const rot = it.rot + it.wobble;
		const lift = it.lift;

		// Peel from the grab point — corner lifts, opposite edge stays “stuck”.
		const peelX = (it.grabU - 0.5) * lift * LIFT_PEEL_DEG;
		const peelY = -(0.5 - it.grabV) * lift * LIFT_PEEL_DEG * 0.65;
		const pullX = (0.5 - it.grabU) * lift * 8;
		const pullY = (0.5 - it.grabV) * lift * 6;
		const riseY = -lift * LIFT_RISE_PX;

		it.hit.style.transformOrigin = `${it.w / 2}px ${it.h / 2}px`;
		it.art.style.transformOrigin = `${it.w / 2}px ${it.h / 2}px`;
		it.art.style.transformStyle = "preserve-3d";

		const t = [
			`translate(${it.x + pullX}px, ${it.y + riseY + pullY}px)`,
			`rotate(${rot}deg)`,
			`rotateX(${peelY}deg)`,
			`rotateY(${peelX}deg)`,
			s !== 1 ? `scale(${s})` : "",
		]
			.filter(Boolean)
			.join(" ");

		it.hit.style.transform = t;
		it.art.style.transform = t;

		// Shadow only while collecting — grows as the sticker lifts away.
		if (lift > 0.02) {
			const offY = 2 + lift * 18;
			const blur = 4 + lift * 22;
			const alpha = 0.08 + lift * 0.26;
			it.art.style.filter = `drop-shadow(0px ${offY}px ${blur}px rgba(0,0,0,${alpha}))`;
		} else {
			it.art.style.filter = "";
		}
	}

	private clampInside(it: Item) {
		it.x = Math.max(0, Math.min(this.W - it.w, it.x));
		it.y = Math.max(0, Math.min(this.H - it.h, it.y));
	}

	private triggerWobble(it: Item) {
		it.wobble = WOBBLE_DEG * (Math.random() > 0.5 ? 1 : -1);
	}

	private bindDrag(it: Item) {
		const onDown = (e: PointerEvent) => {
			e.preventDefault();
			this.host.appendChild(it.hit);
			this.host.appendChild(it.art);
			it.dragging = true;
			it.vx = it.vy = it.vRot = 0;
			it.wobble = 0;

			const r = this.rect();
			const gx = (e.clientX - r.left - it.x) / it.w;
			const gy = (e.clientY - r.top - it.y) / it.h;
			it.grabU = Math.min(1, Math.max(0, gx));
			it.grabV = Math.min(1, Math.max(0, gy));

			it.hit.style.cursor = "grabbing";
			it.hit.style.zIndex = "10";
			it.art.style.zIndex = "9";

			this.drag = {
				item: it,
				dx: e.clientX - r.left - it.x,
				dy: e.clientY - r.top - it.y,
				lastX: e.clientX,
				lastY: e.clientY,
				moved: 0,
				pointerId: e.pointerId,
			};
			it.hit.setPointerCapture?.(e.pointerId);
		};
		it.hit.addEventListener("pointerdown", onDown);
		this.cleanup.push(() => it.hit.removeEventListener("pointerdown", onDown));

		const onMove = (e: PointerEvent) => {
			if (!this.drag || this.drag.item !== it) return;
			const r = this.rect();
			it.tx = e.clientX - r.left - this.drag.dx;
			it.ty = e.clientY - r.top - this.drag.dy;
			this.drag.moved += Math.hypot(
				e.clientX - this.drag.lastX,
				e.clientY - this.drag.lastY,
			);
			this.drag.lastX = e.clientX;
			this.drag.lastY = e.clientY;
		};
		it.hit.addEventListener("pointermove", onMove);
		this.cleanup.push(() => it.hit.removeEventListener("pointermove", onMove));

		const onUp = (e: PointerEvent) => {
			if (!this.drag || this.drag.item !== it) return;
			const wasTap = this.drag.moved < TAP_MOVE_PX;
			it.dragging = false;
			it.hit.style.cursor = "grab";
			it.hit.style.zIndex = "";
			it.art.style.zIndex = "";
			it.vx *= THROW_SCALE;
			it.vy *= THROW_SCALE;
			// Spin from throw velocity; flings feel more physical.
			it.vRot = (it.vx - it.vy) * 0.06 + it.vRot * 0.3;
			if (wasTap) this.triggerWobble(it);
			it.hit.releasePointerCapture?.(e.pointerId);
			this.drag = null;
		};
		it.hit.addEventListener("pointerup", onUp);
		it.hit.addEventListener("pointercancel", onUp);
		this.cleanup.push(() => {
			it.hit.removeEventListener("pointerup", onUp);
			it.hit.removeEventListener("pointercancel", onUp);
		});
	}

	private rect() {
		return this.host.getBoundingClientRect();
	}

	start() {
		if (this.running || this.disposed) return;
		const prevW = this.W;
		this.measure();
		if (!this.laidOut || Math.abs(this.W - prevW) > 2) {
			this.layout();
			this.laidOut = true;
		}

		if (!this.entranceStarted) {
			this.entranceStarted = true;
			const order = [...this.items].sort((a, b) => a.def.x - b.def.x);
			const t0 = performance.now() + 150;
			order.forEach((it, i) => {
				it.appearAt = t0 + i * APPEAR_STAGGER_MS;
			});
		}
		this.running = true;
		this.raf = requestAnimationFrame(this.loop);
	}

	stop() {
		this.running = false;
		if (this.raf) cancelAnimationFrame(this.raf);
		this.raf = 0;
	}

	private layout() {
		if (this.W < 2 || this.H < 2) return;
		this.rerenderAll();
		for (const it of this.items) {
			it.x = it.def.x * this.W - it.w / 2;
			it.y = it.def.y * this.H - it.h / 2;
			it.tx = it.x;
			it.ty = it.y;
			it.vx = it.vy = it.vRot = 0;
			it.rot = it.def.rot;
			it.scale = 1;
			this.clampInside(it);
			this.placeItem(it);
		}
	}

	private loop = () => {
		if (!this.running) return;
		this.now = performance.now();

		for (const it of this.items) {
			if (it.appearAt > 0 && this.now >= it.appearAt && it.appear < 1) {
				it.appear += (1 - it.appear) * APPEAR_EASE;
				if (it.appear > 0.999) it.appear = 1;
			}

			const targetScale = it.dragging ? GRAB_SCALE : 1;
			if (Math.abs(targetScale - it.scale) > 0.001) {
				it.scale += (targetScale - it.scale) * SCALE_EASE;
			}

			const targetLift = it.dragging ? 1 : 0;
			if (Math.abs(targetLift - it.lift) > 0.001) {
				it.lift += (targetLift - it.lift) * LIFT_EASE;
			}

			if (Math.abs(it.wobble) > 0.05) {
				it.wobble *= WOBBLE_DECAY;
			} else {
				it.wobble = 0;
			}

			if (it.dragging) {
				const nx = it.x + (it.tx - it.x) * DRAG_EASE;
				const ny = it.y + (it.ty - it.y) * DRAG_EASE;
				it.vx = nx - it.x;
				it.vy = ny - it.y;
				it.x = nx;
				it.y = ny;
				this.placeItem(it);
				continue;
			}

			const liftSettling = it.lift > 0.02;
			const appearing = it.appearAt > 0 && it.appear < 1;
			const moving =
				Math.abs(it.vx) >= MIN_VEL ||
				Math.abs(it.vy) >= MIN_VEL ||
				Math.abs(it.vRot) >= 0.02;
			if (
				!moving &&
				!liftSettling &&
				Math.abs(it.wobble) < 0.05 &&
				Math.abs(it.scale - 1) < 0.001 &&
				!appearing
			) {
				continue;
			}

			if (liftSettling) {
				this.placeItem(it);
				continue;
			}

			it.x += it.vx;
			it.y += it.vy;
			it.rot += it.vRot;

			if (it.x < 0) {
				it.x = 0;
				it.vx = -it.vx * BOUNCE;
				it.vRot = -it.vRot * BOUNCE;
			} else if (it.x > this.W - it.w) {
				it.x = this.W - it.w;
				it.vx = -it.vx * BOUNCE;
				it.vRot = -it.vRot * BOUNCE;
			}
			if (it.y < 0) {
				it.y = 0;
				it.vy = -it.vy * BOUNCE;
				it.vRot = -it.vRot * BOUNCE;
			} else if (it.y > this.H - it.h) {
				it.y = this.H - it.h;
				it.vy = -it.vy * BOUNCE;
				it.vRot = -it.vRot * BOUNCE;
			}

			it.vx *= FRICTION;
			it.vy *= FRICTION;
			it.vRot *= ROT_FRICTION;
			this.placeItem(it);
		}

		this.raf = requestAnimationFrame(this.loop);
	};

	/** Static scatter for prefers-reduced-motion. */
	renderStill() {
		for (const it of this.items) {
			it.vx = it.vy = it.vRot = 0;
			it.wobble = 0;
			it.scale = 1;
			it.lift = 0;
			it.appear = 1;
			it.rot = it.def.rot;
			this.placeItem(it);
		}
		this.entranceStarted = true;
	}

	refreshFonts() {
		this.measure();
		this.rerenderAll();
	}

	private rerenderAll() {
		const fontSizePx = this.stickerFontPx();
		for (const it of this.items) {
			const r = renderSticker({
				word: it.def.word,
				font: resolveFamily(it.def.font),
				weight: it.def.weight,
				fill: it.def.fill,
				outline: it.def.outline,
				fontSizePx,
			});
			it.w = r.width;
			it.h = r.height;
			it.hit.style.width = `${r.width}px`;
			it.hit.style.height = `${r.height}px`;
			const ctx = it.art.getContext("2d");
			if (!ctx) continue;
			it.art.width = r.canvas.width;
			it.art.height = r.canvas.height;
			it.art.style.width = `${r.width}px`;
			it.art.style.height = `${r.height}px`;
			ctx.clearRect(0, 0, it.art.width, it.art.height);
			ctx.drawImage(r.canvas, 0, 0);
			this.clampInside(it);
			this.placeItem(it);
		}
	}

	destroy() {
		this.disposed = true;
		this.stop();
		for (const fn of this.cleanup) fn();
		this.ro?.disconnect();
		for (const it of this.items) {
			it.hit.parentNode?.removeChild(it.hit);
			it.art.parentNode?.removeChild(it.art);
		}
	}
}
