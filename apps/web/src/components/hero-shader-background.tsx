"use client";

// Hero background: Shader Lab export replaces the static blue CSS gradient.
// Falls back to a muted gradient if WebGPU is unavailable in the browser.

import {
	ShaderLabComposition,
	type ShaderLabConfig,
} from "@basementstudio/shader-lab";

/** Exported from Shader Lab — neon-glow preset with muted grey/mauve tones. */
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
			id: "a924d323-7026-4b54-8738-355ef0d17009",
			kind: "source",
			name: "Gradient",
			opacity: 1,
			params: {
				preset: "neon-glow",
				activePoints: 3,
				point1Color: "#424042",
				point1Position: [0, 0],
				point1Weight: 0.6,
				point2Color: "#AEA8A1",
				point2Position: [0.22999999999999998, -0.63],
				point2Weight: 1.3,
				point3Color: "#615E63",
				point3Position: [0.8, 0.3],
				point3Weight: 1.1,
				point4Color: "#220033",
				point4Position: [0.2, -0.8],
				point4Weight: 0.9,
				point5Color: "#1a0a2e",
				point5Position: [-0.5, 0.7],
				point5Weight: 1,
				noiseType: "ridge",
				noiseSeed: 93.1,
				warpAmount: 0.02,
				warpScale: 4.28,
				warpIterations: 4,
				warpDecay: 2.97,
				warpBias: 0.64,
				vortexAmount: -0.25,
				animate: true,
				motionAmount: 0.81,
				motionSpeed: 0.57,
				falloff: 3.01,
				tonemapMode: "aces",
				glowStrength: 0.62,
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

export function HeroShaderBackground() {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
		>
			{/* Static fallback aligned with the shader palette for non-WebGPU browsers. */}
			<div className="absolute inset-0 bg-linear-to-b from-[#615E63] via-[#AEA8A1] to-[#424042]" />
			{/* Fill the hero band; canvas stretches to cover via object-fit on the inner canvas. */}
			<div className="absolute inset-0 size-full [&_canvas]:size-full [&_canvas]:object-cover">
				<ShaderLabComposition
					config={heroShaderConfig}
					onRuntimeError={(message) => {
						console.error("[HeroShaderBackground]", message);
					}}
				/>
			</div>
		</div>
	);
}
