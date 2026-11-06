"use client";

import Image, { type ImageProps } from "next/image";

/**
 * Site images use `next/image` inside `WorkFigure` / `SkulletProvider`.
 * Skullet attaches a per-image skeleton until decode — no manual swap wrapper.
 *
 * @see https://skullet.lochie.me/docs#images
 */
export function SkulletImage(props: ImageProps) {
	return <Image {...props} />;
}
