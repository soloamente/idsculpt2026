"use client";

import { useEffect, useRef } from "react";

import type { StickerInstance } from "@/types/sticker-forge";

import { resolveFamily, warmStickerFonts } from "./font-utils";
import { loadStickerForge } from "./sticker-forge-loader";
import { STICKERS, type StickerDef } from "./stickers";

type WordStickersPlaygroundProps = {
	className?: string;
};

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

/** Container size from word length — sticker-forge fills the box with die-cut text. */
function stickerBoxSize(word: string) {
	const width = Math.max(128, Math.min(320, word.length * 26 + 56));
	return { width, height: 96 };
}

/** Fewer WebGL instances on touch / narrow viewports to protect mobile GPU. */
function pickStickers(all: StickerDef[], coarse: boolean, narrow: boolean) {
	if (!coarse && !narrow) return all;
	const stride = coarse ? 2 : 1;
	const picked = all.filter((_, i) => i % stride === 0);
	return picked.length >= 6 ? picked : all.slice(0, 6);
}

interface MountedSticker {
	wrapper: HTMLDivElement;
	instance: StickerInstance;
}

/**
 * Full-bleed peelable word stickers powered by sticker-forge (WebGL).
 * Host stays pointer-events-none; each sticker target re-enables drag-to-peel.
 */
export function WordStickersPlayground({ className }: WordStickersPlaygroundProps) {
	const hostRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;

		const parent = host.parentElement;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const coarse = window.matchMedia("(pointer: coarse)").matches;
		const narrow = window.matchMedia("(max-width: 767px)").matches;
		const defs = pickStickers(STICKERS, coarse, narrow);

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

		const layoutAll = () => {
			measure();
			for (const { wrapper } of mounted) {
				const x = Number(wrapper.dataset.x ?? "0.5");
				const y = Number(wrapper.dataset.y ?? "0.5");
				const rot = Number(wrapper.dataset.rot ?? "0");
				const width = Number(wrapper.dataset.width ?? "160");
				const height = Number(wrapper.dataset.height ?? "96");
				wrapper.style.left = `${x * W - width / 2}px`;
				wrapper.style.top = `${y * H - height / 2}px`;
				wrapper.style.transform = `rotate(${rot}deg)`;
			}
		};

		const boot = async () => {
			await warmStickerFonts(defs);
			if (cancelled) return;

			const { createSticker } = await loadStickerForge();
			if (cancelled) return;

			syncHostSize();
			measure();

			const quality = coarse || narrow ? "medium" : "high";
			const soundEnabled = !reduced && !coarse;

			for (let i = 0; i < defs.length; i++) {
				if (cancelled) break;
				const def = defs[i];
				const { width, height } = stickerBoxSize(def.word);
				const family = resolveFamily(def.font);

				const wrapper = document.createElement("div");
				Object.assign(wrapper.style, {
					position: "absolute",
					width: `${width}px`,
					height: `${height}px`,
					pointerEvents: "none",
				});
				wrapper.dataset.x = String(def.x);
				wrapper.dataset.y = String(def.y);
				wrapper.dataset.rot = String(def.rot);
				wrapper.dataset.width = String(width);
				wrapper.dataset.height = String(height);

				const target = document.createElement("div");
				Object.assign(target.style, {
					display: "block",
					width: "100%",
					height: "100%",
					pointerEvents: reduced ? "none" : "auto",
					touchAction: "none",
				});
				wrapper.appendChild(target);
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
	}, []);

	return (
		<div
			ref={hostRef}
			aria-label="Interactive vinyl word stickers — drag the edge to peel"
			className={className}
			role="img"
		/>
	);
}
