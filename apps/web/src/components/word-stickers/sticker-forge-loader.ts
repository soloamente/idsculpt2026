import type { createSticker as CreateStickerFn, StickerInstance } from "@/types/sticker-forge";

type StickerForgeModule = {
	createSticker: typeof CreateStickerFn;
};

let loadPromise: Promise<StickerForgeModule> | null = null;

/** Lazy-load the vendored sticker-forge ES bundle from `/public/embed`. */
export function loadStickerForge(): Promise<StickerForgeModule> {
	if (!loadPromise) {
		loadPromise = (async () => {
			// Variable path avoids TS static module resolution for the public embed.
			const embedUrl = "/embed/sticker-forge.es.js";
			const mod = await import(/* webpackIgnore: true */ embedUrl);
			return mod as StickerForgeModule;
		})();
	}
	return loadPromise;
}

export type { StickerInstance };
