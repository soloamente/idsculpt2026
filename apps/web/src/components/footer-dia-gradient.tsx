"use client";

// Footer glow: fixed to the viewport floor; reveal tracks #site-footer entering view.

import { DiaGradient } from "@/components/dia-gradient/dia-gradient";

export function FooterDiaGradient() {
	return (
		<div
			aria-hidden
			// Tall band so the glow reaches behind contact + footer copy, not just the floor.
			className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-[90dvh]"
		>
			<DiaGradient reveal="scroll" scrollBasis="anchor" scrollAnchor="#site-footer" />
		</div>
	);
}
