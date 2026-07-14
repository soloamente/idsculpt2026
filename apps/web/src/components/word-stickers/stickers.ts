// Vinyl word sticker definitions — each word uses a different face (mini type specimen).
// Outline/fill pairs come from the reference palette: contrasting die-cut outline per word.

export interface StickerDef {
	word: string;
	/** CSS font-family token, e.g. `var(--font-sticker-syne)`. */
	font: string;
	weight: number;
	fill: string;
	/** Die-cut outline color — the dilated silhouette around the glyphs. */
	outline: string;
	x: number;
	y: number;
	rot: number;
}

export const STICKERS: StickerDef[] = [
	{
		word: "sculpt",
		font: "var(--font-sticker-archivo)",
		weight: 400,
		outline: "#ff2e6e",
		fill: "#2b0b4f",
		x: 0.14,
		y: 0.08,
		rot: -7,
	},
	{
		word: "identity",
		font: "var(--font-sticker-instrument)",
		weight: 400,
		outline: "#7c4dff",
		fill: "#eaff5a",
		x: 0.78,
		y: 0.16,
		rot: 4,
	},
	{
		word: "wow",
		font: "var(--font-sticker-syne)",
		weight: 700,
		outline: "#00b3a4",
		fill: "#ff3d6e",
		x: 0.86,
		y: 0.38,
		rot: -12,
	},
	{
		word: "design",
		font: "var(--font-sticker-bricolage)",
		weight: 600,
		outline: "#ff7a1a",
		fill: "#0a2f6b",
		x: 0.22,
		y: 0.52,
		rot: 8,
	},
	{
		word: "ship it",
		font: "var(--font-geist-mono)",
		weight: 500,
		outline: "#1668ff",
		fill: "#7dffb0",
		x: 0.62,
		y: 0.68,
		rot: -3,
	},
	{
		word: "perception",
		font: "var(--font-sticker-fraunces)",
		weight: 500,
		outline: "#ffd21e",
		fill: "#c81e5b",
		x: 0.12,
		y: 0.84,
		rot: 6,
	},
	{
		word: "craft",
		font: "var(--font-sticker-bricolage)",
		weight: 600,
		outline: "#7c4dff",
		fill: "#0a2f6b",
		x: 0.72,
		y: 0.24,
		rot: -5,
	},
	{
		word: "vision",
		font: "var(--font-sticker-instrument)",
		weight: 400,
		outline: "#ff2e6e",
		fill: "#eaff5a",
		x: 0.18,
		y: 0.36,
		rot: 9,
	},
	{
		word: "team",
		font: "var(--font-sticker-syne)",
		weight: 700,
		outline: "#ff7a1a",
		fill: "#2b0b4f",
		x: 0.84,
		y: 0.46,
		rot: -8,
	},
	{
		word: "brand",
		font: "var(--font-sticker-archivo)",
		weight: 400,
		outline: "#00b3a4",
		fill: "#ff3d6e",
		x: 0.08,
		y: 0.58,
		rot: 4,
	},
	{
		word: "motion",
		font: "var(--font-geist-mono)",
		weight: 500,
		outline: "#ffd21e",
		fill: "#1668ff",
		x: 0.68,
		y: 0.7,
		rot: -6,
	},
	{
		word: "form",
		font: "var(--font-sticker-fraunces)",
		weight: 500,
		outline: "#1668ff",
		fill: "#7dffb0",
		x: 0.38,
		y: 0.78,
		rot: 7,
	},
	{
		word: "taste",
		font: "var(--font-sticker-instrument)",
		weight: 400,
		outline: "#ff7a1a",
		fill: "#c81e5b",
		x: 0.52,
		y: 0.9,
		rot: -4,
	},
	{
		word: "bold",
		font: "var(--font-sticker-syne)",
		weight: 700,
		outline: "#ff2e6e",
		fill: "#7dffb0",
		x: 0.9,
		y: 0.32,
		rot: 11,
	},
];
