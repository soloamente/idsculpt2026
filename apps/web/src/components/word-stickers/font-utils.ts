import type { StickerDef } from "./stickers";

/** Resolve a CSS `var(--font-*)` token to the computed family string for canvas. */
export function resolveFamily(cssFamily: string): string {
	const probe = document.createElement("span");
	probe.style.fontFamily = cssFamily;
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.textContent = "Ag";
	document.body.appendChild(probe);
	const fam = getComputedStyle(probe).fontFamily || "sans-serif";
	document.body.removeChild(probe);
	return fam;
}

/** Load webfont files before canvas measures glyphs — avoids fallback outlines. */
export async function warmStickerFonts(
	defs: StickerDef[],
	fontSizePx = 48,
): Promise<void> {
	const loads = defs.map((def) => {
		const family = resolveFamily(def.font);
		return document.fonts.load(`${def.weight} ${fontSizePx}px ${family}`);
	});
	await Promise.all(loads);
	await document.fonts.ready;
}
