/** Public types for the vendored `/embed/sticker-forge.es.js` bundle (MIT, CatsJuice/sticker-forge). */

export type StickerSource =
	| StickerTextSource
	| StickerSvgSource
	| StickerImageSource;

export interface StickerTextSource {
	type: "text";
	text: string;
	color?: string;
	fontFamily?: string;
	fontWeight?: number | string;
}

export interface StickerSvgSource {
	type: "svg";
	svg: string;
}

export interface StickerImageSource {
	type: "image";
	src: string;
	name?: string;
}

export interface StickerOptions {
	source?: StickerSource;
	outline?: { width?: number; color?: string };
	shadow?: {
		color?: string;
		opacity?: number;
		blur?: number;
		distance?: number;
		angle?: number;
	};
	peel?: {
		radius?: number;
		stiffness?: number;
		grabWidth?: number;
		maxAngle?: number;
		release?: "reset" | "stay" | "snap";
	};
	back?: { color?: string; gloss?: number; roughness?: number };
	sound?: { src?: string; volume?: number; enabled?: boolean };
	tilt?: number;
	wind?: number;
	quality?: "low" | "medium" | "high";
}

export interface StickerInstance {
	setSource(source: StickerSource): Promise<void>;
	setOptions(options: Partial<StickerOptions>): void;
	reset(): void;
	resize(): void;
	getState(): Readonly<{
		ready: boolean;
		dragging: boolean;
		progress: number;
	}>;
	destroy(): void;
}

export declare function createSticker(
	target: HTMLElement,
	options?: StickerOptions,
): Promise<StickerInstance>;

export declare function defineStickerForge(): void;

declare global {
	interface HTMLElementTagNameMap {
		"sticker-forge": HTMLElement & StickerInstance;
	}
}
