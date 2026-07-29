"use client";

// Per-card Shader Lab backdrop for team carousel cards.
// Each member gets their own palette; cursor follow runs on the card surface.

import {
	ShaderLabComposition,
	type ShaderLabConfig,
} from "@basementstudio/shader-lab";
import { useReducedMotion } from "framer-motion";
import { memo, useCallback, useEffect, useRef, useState } from "react";

/** Gradient stops derived from each member's Figma card colors. */
export interface TeamCardShaderPalette {
	point1: string;
	point2: string;
	point3: string;
	fallbackFrom: string;
	fallbackTo: string;
	noiseSeed: number;
}

const BASE_POINT1: [number, number] = [0.02, 0.24];
const BASE_POINT3: [number, number] = [0.78, 0.38];
const BASE_POINT2: [number, number] = [0.28, -0.58];
/** Extra dark blob anchors — kept toward the card bottom so big spots show there too. */
const BASE_POINT4: [number, number] = [-0.12, 0.72];
const BASE_POINT5: [number, number] = [0.62, 0.84];
const BASE_POINT1_WEIGHT = 0.68;
const BASE_POINT3_WEIGHT = 1.18;
const BASE_POINT4_WEIGHT = 1.28;
const BASE_POINT5_WEIGHT = 1.14;
const BASE_VORTEX = -0.22;
const BASE_WARP = 0.022;
const BASE_GLOW = 0.48;
const BASE_MOTION = 0.58;
const HOVER_WARP = 0.042;
const HOVER_VORTEX = -0.32;

const CURSOR_FOLLOW = 0.9;
const CURSOR_EASE = 0.15;
const RETURN_EASE = 0.1;

function createTeamCardShaderConfig(
	palette: TeamCardShaderPalette,
	layerId: string,
): ShaderLabConfig {
	return {
		layers: [
			{
				blendMode: "normal",
				compositeMode: "filter",
				maskConfig: {
					invert: false,
					mode: "multiply",
					source: "luminance",
				},
				hue: 0,
				id: layerId,
				kind: "source",
				name: "Gradient",
				opacity: 1,
				params: {
					preset: "neon-glow",
					activePoints: 5,
					point1Color: palette.point1,
					point1Position: [...BASE_POINT1],
					point1Weight: BASE_POINT1_WEIGHT,
					point2Color: palette.point2,
					point2Position: [...BASE_POINT2],
					point2Weight: 1.18,
					point3Color: palette.point3,
					point3Position: [...BASE_POINT3],
					point3Weight: BASE_POINT3_WEIGHT,
					point4Color: palette.point3,
					point4Position: [...BASE_POINT4],
					point4Weight: BASE_POINT4_WEIGHT,
					point5Color: palette.point3,
					point5Position: [...BASE_POINT5],
					point5Weight: BASE_POINT5_WEIGHT,
					noiseType: "ridge",
					noiseSeed: palette.noiseSeed,
					warpAmount: BASE_WARP,
					warpScale: 4.2,
					warpIterations: 4,
					warpDecay: 2.78,
					warpBias: 0.62,
					vortexAmount: BASE_VORTEX,
					animate: true,
					motionAmount: BASE_MOTION,
					motionSpeed: 0.46,
					falloff: 2.35,
					tonemapMode: "aces",
					glowStrength: BASE_GLOW,
					glowThreshold: 0,
					grainAmount: 0.006,
					vignetteStrength: 0.28,
					vignetteRadius: 1.55,
					vignetteSoftness: 1,
				},
				saturation: 1.12,
				type: "gradient",
				visible: true,
			},
		],
		timeline: {
			duration: 9,
			loop: true,
			tracks: [],
		},
	};
}

function getGradientParams(config: ShaderLabConfig) {
	return config.layers.find((entry) => entry.type === "gradient")?.params;
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

interface TeamCardShaderBackgroundProps {
	palette: TeamCardShaderPalette;
	/** Stable id per member — keeps Shader Lab layer ids unique across cards. */
	memberKey: string;
	/** Stagger first mount so four WebGPU inits don't race on page load. */
	mountIndex?: number;
	/** Team carousel section intersects the viewport — gates boot and pauses all cards off-screen. */
	sectionVisible?: boolean;
	/** Card is near carousel center — only the focused card runs motion + cursor follow. */
	motionActive?: boolean;
}

export const TeamCardShaderBackground = memo(function TeamCardShaderBackground({
	palette,
	memberKey,
	mountIndex = 0,
	sectionVisible = true,
	motionActive = true,
}: TeamCardShaderBackgroundProps) {
	const shellRef = useRef<HTMLDivElement>(null);
	const shaderCanvasRef = useRef<HTMLDivElement>(null);
	const configRef = useRef<ShaderLabConfig>(
		createTeamCardShaderConfig(palette, `team-card-shader-${memberKey}`),
	);
	const prefersReducedMotion = useReducedMotion();
	const finePointerRef = useRef(false);
	const cardHoverRef = useRef(false);
	const cursorRef = useRef<[number, number]>([0, 0]);
	// Track visibility in refs so rAF can read without re-subscribing every scroll frame.
	const sectionVisibleRef = useRef(sectionVisible);
	const motionActiveRef = useRef(motionActive);
	// Mount once per card — never unmount when carousel focus changes.
	const [shaderReady, setShaderReady] = useState(false);
	const shaderBootedRef = useRef(false);
	const smoothedRef = useRef({
		p1x: BASE_POINT1[0],
		p1y: BASE_POINT1[1],
		p2x: BASE_POINT2[0],
		p2y: BASE_POINT2[1],
		p3x: BASE_POINT3[0],
		p3y: BASE_POINT3[1],
		p4x: BASE_POINT4[0],
		p4y: BASE_POINT4[1],
		p5x: BASE_POINT5[0],
		p5y: BASE_POINT5[1],
		warp: BASE_WARP,
		vortex: BASE_VORTEX,
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

	sectionVisibleRef.current = sectionVisible;
	motionActiveRef.current = motionActive;

	// Desktop-only, deferred boot when the carousel enters view — stays mounted after ready.
	useEffect(() => {
		if (!sectionVisible || shaderBootedRef.current || prefersReducedMotion) {
			return;
		}

		const media = window.matchMedia("(hover: hover) and (pointer: fine)");
		if (!media.matches) {
			return;
		}

		const bootTimer = window.setTimeout(() => {
			shaderBootedRef.current = true;
			setShaderReady(true);
		}, mountIndex * 160);

		return () => {
			window.clearTimeout(bootTimer);
		};
	}, [sectionVisible, mountIndex, prefersReducedMotion]);

	// Pause GPU work off-screen / on side cards without tearing down WebGPU (re-init freezes).
	useEffect(() => {
		if (!shaderReady) {
			return;
		}

		const params = getGradientParams(configRef.current);
		if (!params) {
			return;
		}

		const gpuActive = sectionVisible && motionActive;
		params.animate = gpuActive;
		params.motionAmount = gpuActive ? BASE_MOTION : 0;

		if (shaderCanvasRef.current) {
			shaderCanvasRef.current.style.visibility = sectionVisible
				? "visible"
				: "hidden";
		}

		if (!sectionVisible) {
			cardHoverRef.current = false;
		}
	}, [sectionVisible, motionActive, shaderReady]);

	// Stable handler — ShaderLabComposition re-inits if this reference changes.
	const handleRuntimeError = useCallback((message: string | null) => {
		if (message) {
			console.error("[TeamCardShaderBackground]", memberKey, message);
		}
	}, [memberKey]);

	// Cursor follow on the 3D card surface (parent article receives pointer events).
	useEffect(() => {
		if (prefersReducedMotion) {
			return;
		}

		const card = shellRef.current?.parentElement;
		if (!card) {
			return;
		}

		const updateCursor = (event: PointerEvent) => {
			if (!finePointerRef.current || event.pointerType !== "mouse") {
				return;
			}
			cursorRef.current = pointerToShaderSpace(
				event.clientX,
				event.clientY,
				card.getBoundingClientRect(),
			);
		};

		const onPointerMove = (event: PointerEvent) => {
			cardHoverRef.current = true;
			updateCursor(event);
		};

		const onPointerLeave = () => {
			cardHoverRef.current = false;
		};

		card.addEventListener("pointermove", onPointerMove);
		card.addEventListener("pointerleave", onPointerLeave);
		return () => {
			card.removeEventListener("pointermove", onPointerMove);
			card.removeEventListener("pointerleave", onPointerLeave);
		};
	}, [prefersReducedMotion]);

	useEffect(() => {
		if (prefersReducedMotion || !shaderReady) {
			return;
		}

		let raf = 0;
		const tick = () => {
			if (!sectionVisibleRef.current || !motionActiveRef.current) {
				raf = requestAnimationFrame(tick);
				return;
			}

			const params = getGradientParams(configRef.current);
			const smoothed = smoothedRef.current;
			const cursor = cursorRef.current;
			const cardActive = cardHoverRef.current;

			const pull = cardActive ? CURSOR_FOLLOW : 0;
			const target1 = cardActive
				? towardPoint(BASE_POINT1, cursor, pull)
				: BASE_POINT1;
			const target2 = cardActive
				? towardPoint(BASE_POINT2, cursor, pull * 0.88)
				: BASE_POINT2;
			const target3 = cardActive
				? towardPoint(BASE_POINT3, cursor, pull * 0.94)
				: BASE_POINT3;
			// Dark blobs — strongest follow so big spots track the pointer on the lower card.
			const target4 = cardActive
				? towardPoint(BASE_POINT4, cursor, pull * 0.98)
				: BASE_POINT4;
			const target5 = cardActive
				? towardPoint(BASE_POINT5, cursor, pull * 0.96)
				: BASE_POINT5;

			const pointEase = cardActive ? CURSOR_EASE : RETURN_EASE;
			smoothed.p1x += (target1[0] - smoothed.p1x) * pointEase;
			smoothed.p1y += (target1[1] - smoothed.p1y) * pointEase;
			smoothed.p2x += (target2[0] - smoothed.p2x) * pointEase;
			smoothed.p2y += (target2[1] - smoothed.p2y) * pointEase;
			smoothed.p3x += (target3[0] - smoothed.p3x) * pointEase;
			smoothed.p3y += (target3[1] - smoothed.p3y) * pointEase;
			smoothed.p4x += (target4[0] - smoothed.p4x) * pointEase;
			smoothed.p4y += (target4[1] - smoothed.p4y) * pointEase;
			smoothed.p5x += (target5[0] - smoothed.p5x) * pointEase;
			smoothed.p5y += (target5[1] - smoothed.p5y) * pointEase;

			const targetWarp = cardActive ? HOVER_WARP : BASE_WARP;
			const targetVortex = cardActive ? HOVER_VORTEX : BASE_VORTEX;
			smoothed.warp += (targetWarp - smoothed.warp) * pointEase;
			smoothed.vortex += (targetVortex - smoothed.vortex) * pointEase;

			if (params) {
				params.point1Position = [smoothed.p1x, smoothed.p1y];
				params.point2Position = [smoothed.p2x, smoothed.p2y];
				params.point3Position = [smoothed.p3x, smoothed.p3y];
				params.point4Position = [smoothed.p4x, smoothed.p4y];
				params.point5Position = [smoothed.p5x, smoothed.p5y];
				params.point1Weight = lerp(
					BASE_POINT1_WEIGHT,
					1.04,
					cardActive ? 0.32 : 0,
				);
				params.point3Weight = lerp(
					BASE_POINT3_WEIGHT,
					1.48,
					cardActive ? 0.45 : 0,
				);
				params.point4Weight = lerp(
					BASE_POINT4_WEIGHT,
					1.62,
					cardActive ? 0.55 : 0,
				);
				params.point5Weight = lerp(
					BASE_POINT5_WEIGHT,
					1.52,
					cardActive ? 0.52 : 0,
				);
				params.warpAmount = smoothed.warp;
				params.vortexAmount = smoothed.vortex;
			}

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [prefersReducedMotion, shaderReady]);

	return (
		<div
			ref={shellRef}
			aria-hidden
			className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl"
		>
			<div
				className="absolute inset-0"
				style={{
					// CSS fallback when WebGPU is unavailable — matches member palette.
					backgroundImage: `linear-gradient(to bottom, ${palette.fallbackFrom}, ${palette.fallbackTo})`,
				}}
			/>
			<div
				ref={shaderCanvasRef}
				className="absolute inset-0 size-full [&_canvas]:size-full [&_canvas]:object-cover"
			>
				{/* WebGPU stays mounted after first boot — unmounting forces a costly re-init on scroll back. */}
				{shaderReady ? (
					<ShaderLabComposition
						config={configRef.current}
						onRuntimeError={handleRuntimeError}
					/>
				) : null}
			</div>
		</div>
	);
});
