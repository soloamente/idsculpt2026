import { type RevealSpec, type SkulletTheme, sequence } from "skullet";

// Shared skeleton reveal: staggered pieces with a soft blur as content lands.
export const skulletReveal: RevealSpec = {
	...sequence,
	enter: { filter: "blur(6px)" },
};

/** Pre-footer copy: same blur enter, longer crossfade. */
export const skulletRevealSlow: RevealSpec = {
	...skulletReveal,
	duration: 720,
	delay: 100,
};

export const skulletTheme: SkulletTheme = {
	animation: "group-shimmer",
	speed: "slow",
	text: {
		top: "ascender",
		bottom: "descender",
	},
};
