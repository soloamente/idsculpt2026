"use client";

// Hero background: Shader Lab export replaces the static blue CSS gradient.
// Falls back to a muted gradient if WebGPU is unavailable in the browser.
//
// Desktop:
//   • Hero — dark gradient stops follow the cursor.
//   • Discover — extra glow / warp pulse on top of the cursor follow.

import {
	ShaderLabComposition,
	type ShaderLabConfig,
} from "@basementstudio/shader-lab";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

/** Must match the Discover link id on the homepage hero. */
export const HERO_DISCOVER_ID = "hero-discover";

const BASE_POINT1: [number, number] = [0, 0];
const BASE_POINT3: [number, number] = [0.8, 0.3];
const BASE_POINT2: [number, number] = [0.23, -0.63];
const BASE_POINT1_WEIGHT = 0.6;
const BASE_POINT3_WEIGHT = 1.1;
const BASE_VORTEX = -0.25;
const BASE_WARP = 0.02;
const BASE_GLOW = 0.62;
const BASE_MOTION = 0.81;

/** Cursor follow — dark stops chase the pointer across the hero. */
const CURSOR_FOLLOW = 0.94;
const CURSOR_EASE = 0.16;
const RETURN_EASE = 0.1;

/** Discover hover adds a glow / warp swell on top of cursor follow. */
const DISCOVER_GLOW = 0.88;
const DISCOVER_WARP = 0.058;
const DISCOVER_VORTEX_PULL = 0.18;
const DISCOVER_MOTION = 0.48;
const DISCOVER_FOCUS_EASE = 0.14;

const GRADIENT_LAYER_ID = "a924d323-7026-4b54-8738-355ef0d17009";

const heroShaderConfig: ShaderLabConfig = {
	layers: [
		{
			blendMode: "normal",
			compositeMode: "filter",
			maskConfig: {
				invert: false,
				mode: "multiply",
				source: "luminance",
			},
			hue: -180,
			id: GRADIENT_LAYER_ID,
			kind: "source",
			name: "Gradient",
			opacity: 1,
			params: {
				preset: "neon-glow",
				activePoints: 3,
				point1Color: "#424042",
				point1Position: [...BASE_POINT1],
				point1Weight: BASE_POINT1_WEIGHT,
				point2Color: "#AEA8A1",
				point2Position: [...BASE_POINT2],
				point2Weight: 1.3,
				point3Color: "#615E63",
				point3Position: [...BASE_POINT3],
				point3Weight: BASE_POINT3_WEIGHT,
				point4Color: "#220033",
				point4Position: [0.2, -0.8],
				point4Weight: 0.9,
				point5Color: "#1a0a2e",
				point5Position: [-0.5, 0.7],
				point5Weight: 1,
				noiseType: "ridge",
				noiseSeed: 93.1,
				warpAmount: BASE_WARP,
				warpScale: 4.28,
				warpIterations: 4,
				warpDecay: 2.97,
				warpBias: 0.64,
				vortexAmount: BASE_VORTEX,
				animate: true,
				motionAmount: BASE_MOTION,
				motionSpeed: 0.57,
				falloff: 3.01,
				tonemapMode: "aces",
				glowStrength: BASE_GLOW,
				glowThreshold: 0,
				grainAmount: 0.04,
				vignetteStrength: 0.36,
				vignetteRadius: 1.5,
				vignetteSoftness: 1,
			},
			saturation: 1.15,
			type: "gradient",
			visible: true,
		},
	],
	timeline: {
		duration: 8,
		loop: true,
		tracks: [],
	},
};

function getGradientParams() {
	return heroShaderConfig.layers.find((entry) => entry.type === "gradient")
		?.params;
}

function pointerToShaderSpace(
	clientX: number,
	clientY: number,
	rect: DOMRect,
): [number, number] {
	const nx = (clientX - rect.left) / Math.max(rect.width, 1);
	const ny = (clientY - rect.top) / Math.max(rect.height, 1);
	return [nx * 2 - 1, -(ny * 2 - 1)];
}

function towardPoint(
	base: [number, number],
	target: [number, number],
	amount: number,
): [number, number] {
	return [
		base[0] + (target[0] - base[0]) * amount,
		base[1] + (target[1] - base[1]) * amount,
	];
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

export function HeroShaderBackground() {
	const shellRef = useRef<HTMLDivElement>(null);
	const prefersReducedMotion = useReducedMotion();
	const finePointerRef = useRef(false);
	const heroHoverRef = useRef(false);
	const discoverHoverRef = useRef(false);
	const cursorRef = useRef<[number, number]>([0, 0]);
	const smoothedRef = useRef({
		p1x: BASE_POINT1[0],
		p1y: BASE_POINT1[1],
		p3x: BASE_POINT3[0],
		p3y: BASE_POINT3[1],
		discoverFocus: 0,
		glow: BASE_GLOW,
		warp: BASE_WARP,
		vortex: BASE_VORTEX,
		motion: BASE_MOTION,
	});

	useEffect(() => {
		const media = window.matchMedia("(hover: hover) and (pointer: fine)");
		const sync = () => {
			finePointerRef.current = media.matches;
		};
		sync();
		media.addEventListener("change", sync);
		return () => media.removeEventListener("change", sync);
	}, []);

	// Hero — cursor follow anywhere on the band (events bubble from headline / Discover).
	useEffect(() => {
		if (prefersReducedMotion) {
			return;
		}

		const hero =
			document.getElementById("hero") ?? shellRef.current?.parentElement;
		if (!hero) {
			return;
		}

		const updateCursor = (event: PointerEvent) => {
			if (!finePointerRef.current || event.pointerType !== "mouse") {
				return;
			}
			cursorRef.current = pointerToShaderSpace(
				event.clientX,
				event.clientY,
				hero.getBoundingClientRect(),
			);
		};

		const onPointerMove = (event: PointerEvent) => {
			heroHoverRef.current = true;
			updateCursor(event);
		};

		const onPointerLeave = () => {
			heroHoverRef.current = false;
		};

		hero.addEventListener("pointermove", onPointerMove);
		hero.addEventListener("pointerleave", onPointerLeave);
		return () => {
			hero.removeEventListener("pointermove", onPointerMove);
			hero.removeEventListener("pointerleave", onPointerLeave);
		};
	}, [prefersReducedMotion]);

	// Discover — extra glow / warp on top of cursor follow.
	useEffect(() => {
		if (prefersReducedMotion) {
			return;
		}

		const bindDiscover = () => {
			const discover = document.getElementById(HERO_DISCOVER_ID);
			if (!discover) {
				return null;
			}

			const onPointerEnter = () => {
				if (!finePointerRef.current) {
					return;
				}
				discoverHoverRef.current = true;
			};

			const onPointerLeave = () => {
				discoverHoverRef.current = false;
			};

			discover.addEventListener("pointerenter", onPointerEnter);
			discover.addEventListener("pointerleave", onPointerLeave);
			return () => {
				discover.removeEventListener("pointerenter", onPointerEnter);
				discover.removeEventListener("pointerleave", onPointerLeave);
			};
		};

		let cleanup = bindDiscover();
		if (!cleanup) {
			const retryId = window.requestAnimationFrame(() => {
				cleanup = bindDiscover();
			});
			return () => {
				window.cancelAnimationFrame(retryId);
				cleanup?.();
			};
		}

		return cleanup;
	}, [prefersReducedMotion]);

	useEffect(() => {
		if (prefersReducedMotion) {
			return;
		}

		let raf = 0;
		const tick = () => {
			const params = getGradientParams();
			const smoothed = smoothedRef.current;
			const cursor = cursorRef.current;
			const heroActive = heroHoverRef.current;

			const targetDiscoverFocus = discoverHoverRef.current ? 1 : 0;
			smoothed.discoverFocus +=
				(targetDiscoverFocus - smoothed.discoverFocus) *
				DISCOVER_FOCUS_EASE;
			const discoverFocus = smoothed.discoverFocus;

			const pull = heroActive ? CURSOR_FOLLOW : 0;
			const target1 = heroActive
				? towardPoint(BASE_POINT1, cursor, pull)
				: BASE_POINT1;
			const target3 = heroActive
				? towardPoint(BASE_POINT3, cursor, pull * 0.92)
				: BASE_POINT3;

			const pointEase = heroActive ? CURSOR_EASE : RETURN_EASE;
			smoothed.p1x += (target1[0] - smoothed.p1x) * pointEase;
			smoothed.p1y += (target1[1] - smoothed.p1y) * pointEase;
			smoothed.p3x += (target3[0] - smoothed.p3x) * pointEase;
			smoothed.p3y += (target3[1] - smoothed.p3y) * pointEase;

			const targetGlow = lerp(BASE_GLOW, DISCOVER_GLOW, discoverFocus);
			const targetWarp = lerp(BASE_WARP, DISCOVER_WARP, discoverFocus);
			const targetVortex =
				BASE_VORTEX + cursor[0] * DISCOVER_VORTEX_PULL * discoverFocus;
			const targetMotion = lerp(
				BASE_MOTION,
				DISCOVER_MOTION,
				discoverFocus,
			);

			const fxEase = discoverFocus > 0.02 ? DISCOVER_FOCUS_EASE : RETURN_EASE;
			smoothed.glow += (targetGlow - smoothed.glow) * fxEase;
			smoothed.warp += (targetWarp - smoothed.warp) * fxEase;
			smoothed.vortex += (targetVortex - smoothed.vortex) * fxEase;
			smoothed.motion += (targetMotion - smoothed.motion) * fxEase;

			if (params) {
				params.point1Position = [smoothed.p1x, smoothed.p1y];
				params.point2Position = [...BASE_POINT2];
				params.point3Position = [smoothed.p3x, smoothed.p3y];
				params.point1Weight = lerp(
					BASE_POINT1_WEIGHT,
					1.12,
					heroActive ? 0.35 + discoverFocus * 0.65 : 0,
				);
				params.point3Weight = lerp(
					BASE_POINT3_WEIGHT,
					1.52,
					heroActive ? 0.35 + discoverFocus * 0.65 : 0,
				);
				params.glowStrength = smoothed.glow;
				params.warpAmount = smoothed.warp;
				params.vortexAmount = smoothed.vortex;
				params.motionAmount = smoothed.motion;
			}

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [prefersReducedMotion]);

	return (
		<div
			ref={shellRef}
			aria-hidden
			className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
		>
			<div className="absolute inset-0 bg-linear-to-b from-[#615E63] via-[#AEA8A1] to-[#424042]" />
			<div className="absolute inset-0 size-full [&_canvas]:size-full [&_canvas]:object-cover">
				<ShaderLabComposition
					config={heroShaderConfig}
					onRuntimeError={(message) => {
						console.error("[HeroShaderBackground]", message);
					}}
				/>
			</div>
			{/* Bottom scrim — mask feathers the top edge so no hard band where fade begins. */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[clamp(14rem,52vh,32rem)] bg-background mask-[linear-gradient(to_bottom,transparent_0%,transparent_18%,rgba(0,0,0,0.08)_32%,rgba(0,0,0,0.28)_48%,rgba(0,0,0,0.62)_68%,black_88%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,transparent_18%,rgba(0,0,0,0.08)_32%,rgba(0,0,0,0.28)_48%,rgba(0,0,0,0.62)_68%,black_88%)]"
			/>
		</div>
	);
}
