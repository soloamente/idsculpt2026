"use client";

import dynamic from "next/dynamic";

/** Client wrapper — `ssr: false` is only valid inside Client Components (Next.js App Router). */
export const HeroShaderBackgroundLazy = dynamic(
	() =>
		import("@/components/hero-shader-background").then(
			(mod) => mod.HeroShaderBackground,
		),
	{ ssr: false },
);
