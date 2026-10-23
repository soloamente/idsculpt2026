"use client";

import { useEffect, useRef, useState } from "react";

import type { StickerInstance } from "@/types/sticker-forge";

import { resolveFamily, warmStickerFonts } from "./font-utils";
import { loadStickerForge } from "./sticker-forge-loader";
import { STICKERS } from "./stickers";

type WordStickersPlaygroundProps = {
	className?: string;
};

/**
 * WebGL viewport height — sticker-forge demo uses ~420px.
 * Peel curl + projected shadow need a tall canvas; CSS scale shrinks to the layout footprint.
 */
const STICKER_CANVAS_HEIGHT = 380;

/** Die-cut mesh occupies ~78% of canvas width inside sticker-forge's internal layout. */
const FORGE_MESH_WIDTH_RATIO = 0.78;

/** Shared peel/shadow tuning — matches sticker-forge demo defaults. */
const FORGE_DEFAULTS = {
	outlineWidth: 16,
	shadow: { opacity: 0.22, blur: 22, distance: 16, angle: 42 },
	peel: {
		radius: 0.12,
		stiffness: 0.72,
		maxAngle: 3.55,
		release: "reset" as const,
	},
	back: { color: "#f7f5f2", gloss: 0.7, roughness: 0.3 },
	soundVolume: 0.68,
};

/** Target visual footprint on the page (word length drives width). */
function stickerBoxSize(word: string) {
	const width = Math.max(128, Math.min(320, word.length * 26 + 56));
	return { width, height: 96 };
}

/** Large WebGL canvas + CSS scale so peel FX stay inside the canvas bounds. */
function stickerLayout(word: string, canvasHeight: number) {
	const content = stickerBoxSize(word);
	const canvasWidth = Math.max(240, Math.round(content.width * (canvasHeight / content.height)));
	// Scale down so the ~78%-wide mesh matches the intended content width on the page.
	const visualScale = content.width / (canvasWidth * FORGE_MESH_WIDTH_RATIO);
	const visualWidth = canvasWidth * visualScale;
	const visualHeight = canvasHeight * visualScale;
	return { content, canvasWidth, canvasHeight, visualScale, visualWidth, visualHeight };
}

interface MountedSticker {
	wrapper: HTMLDivElement;
	instance: StickerInstance;
}

/**
 * Full-bleed peelable word stickers powered by sticker-forge (WebGL).
 * Host stays pointer-events-none; each sticker target re-enables drag-to-peel.
 */
/** Touch phones and narrow windows do not get the WebGL stickers. */
function stickersAllowed() {
	const coarse = window.matchMedia("(pointer: coarse)").matches;
	const narrow = window.matchMedia("(max-width: 767px)").matches;
	return !coarse && !narrow;
}

export function WordStickersPlayground({ className }: WordStickersPlaygroundProps) {
	const hostRef = useRef<HTMLDivElement>(null);
	// False until measured so phones never mount the host or load the WebGL bundle.
	const [showStickers, setShowStickers] = useState(false);

	useEffect(() => {
		setShowStickers(stickersAllowed());
	}, []);

	useEffect(() => {
		const host = hostRef.current;
		if (!showStickers || !host) return;

		const parent = host.parentElement;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const defs = STICKERS;

		let cancelled = false;
		const mounted: MountedSticker[] = [];

		const syncHostSize = () => {
			if (!parent) return;
			host.style.width = `${parent.clientWidth}px`;
			host.style.height = `${parent.scrollHeight}px`;
		};
		syncHostSize();

		let parentRo: ResizeObserver | undefined;
		if (parent) {
			parentRo = new ResizeObserver(() => {
				syncHostSize();
				for (const { instance } of mounted) instance.resize();
				layoutAll();
			});
			parentRo.observe(parent);
		}

		let W = host.clientWidth || 1;
		let H = host.clientHeight || 1;

		const measure = () => {
			W = host.clientWidth || 1;
			H = host.clientHeight || 1;
		};

		/** Place a wrapper using normalized x/y — call before append so stickers never flash at (0,0). */
		const positionWrapper = (wrapper: HTMLDivElement, viewportW: number, viewportH: number) => {
			const x = Number(wrapper.dataset.x ?? "0.5");
			const y = Number(wrapper.dataset.y ?? "0.5");
			const rot = Number(wrapper.dataset.rot ?? "0");
			const wrapW = Number(wrapper.dataset.wrapWidth ?? "256");
			const wrapH = Number(wrapper.dataset.wrapHeight ?? "192");
			wrapper.style.left = `${x * viewportW - wrapW / 2}px`;
			wrapper.style.top = `${y * viewportH - wrapH / 2}px`;
			wrapper.style.transform = `rotate(${rot}deg)`;
		};

		const layoutAll = () => {
			measure();
			for (const { wrapper } of mounted) {
				positionWrapper(wrapper, W, H);
			}
		};

		const boot = async () => {
			await warmStickerFonts(defs);
			if (cancelled) return;

			const { createSticker } = await loadStickerForge();
			if (cancelled) return;

			syncHostSize();
			measure();

			const quality = "high";
			const soundEnabled = !reduced;
			const canvasHeight = STICKER_CANVAS_HEIGHT;

			for (let i = 0; i < defs.length; i++) {
				if (cancelled) break;
				const def = defs[i];
				const layout = stickerLayout(def.word, canvasHeight);
				const family = resolveFamily(def.font);

				const wrapper = document.createElement("div");
				Object.assign(wrapper.style, {
					position: "absolute",
					width: `${layout.visualWidth}px`,
					height: `${layout.visualHeight}px`,
					overflow: "visible",
					pointerEvents: "none",
				});
				wrapper.dataset.x = String(def.x);
				wrapper.dataset.y = String(def.y);
				wrapper.dataset.rot = String(def.rot);
				wrapper.dataset.wrapWidth = String(layout.visualWidth);
				wrapper.dataset.wrapHeight = String(layout.visualHeight);

				// Full-size WebGL canvas, visually scaled — peel renders inside the large canvas, not the small footprint.
				const scaleRoot = document.createElement("div");
				Object.assign(scaleRoot.style, {
					position: "absolute",
					left: "50%",
					top: "50%",
					width: `${layout.canvasWidth}px`,
					height: `${layout.canvasHeight}px`,
					transform: `translate(-50%, -50%) scale(${layout.visualScale})`,
					transformOrigin: "center center",
					overflow: "visible",
					pointerEvents: "none",
				});

				const target = document.createElement("div");
				Object.assign(target.style, {
					width: "100%",
					height: "100%",
					display: "block",
					pointerEvents: reduced ? "none" : "auto",
					touchAction: "none",
				});
				scaleRoot.appendChild(target);
				wrapper.appendChild(scaleRoot);

				// Position before mount — avoids the top-left pile-up while fonts/WebGL init.
				positionWrapper(wrapper, W, H);
				host.appendChild(wrapper);

				const instance = await createSticker(target, {
					outline: { width: FORGE_DEFAULTS.outlineWidth, color: def.outline },
					shadow: FORGE_DEFAULTS.shadow,
					peel: FORGE_DEFAULTS.peel,
					back: FORGE_DEFAULTS.back,
					sound: { enabled: soundEnabled, volume: FORGE_DEFAULTS.soundVolume },
					tilt: def.rot * 0.35,
					quality,
					source: {
						type: "text",
						text: def.word,
						color: def.fill,
						fontFamily: family,
						fontWeight: def.weight,
					},
				});

				if (cancelled) {
					instance.destroy();
					wrapper.remove();
					break;
				}

				mounted.push({ wrapper, instance });
				layoutAll();

				// Spread WebGL init across frames so first paint stays responsive.
				await new Promise<void>((resolve) => {
					requestAnimationFrame(() => resolve());
				});
			}

			layoutAll();
		};

		void boot();

		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) return;
				for (const { instance } of mounted) instance.resize();
			},
			{ rootMargin: "80px", threshold: 0.05 },
		);
		io.observe(host);

		return () => {
			cancelled = true;
			parentRo?.disconnect();
			io.disconnect();
			for (const { instance, wrapper } of mounted) {
				instance.destroy();
				wrapper.remove();
			}
		};
	}, [showStickers]);

	if (!showStickers) {
		return null;
	}

	return (
		<div
			ref={hostRef}
			aria-label="Interactive vinyl word stickers — drag the edge to peel"
			className={`overflow-visible ${className ?? ""}`}
			role="img"
			style={{ overflow: "visible" }}
		/>
	);
}
