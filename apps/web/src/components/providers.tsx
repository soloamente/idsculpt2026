"use client";

import Lenis from "lenis";
import { Toaster } from "@idsculpt/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/utils/trpc";

/** Skip smooth-scroll on touch / coarse pointers — native scroll is smoother and cheaper. */
function shouldUseLenis() {
	if (typeof window === "undefined") {
		return false;
	}
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		return false;
	}
	// Coarse pointer or no hover capability → mobile / tablet touch; Lenis adds an extra rAF loop.
	if (window.matchMedia("(pointer: coarse)").matches) {
		return false;
	}
	if (!window.matchMedia("(hover: hover)").matches) {
		return false;
	}
	return true;
}

export default function Providers({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		if (!shouldUseLenis()) {
			// Bridge native scroll for scroll-linked UI (footer glow) when Lenis is off.
			const onNativeScroll = () => {
				window.dispatchEvent(new Event("app-scroll"));
			};
			window.addEventListener("scroll", onNativeScroll, { passive: true });
			return () => window.removeEventListener("scroll", onNativeScroll);
		}

		// Centralize smooth-scroll lifecycle so route content can opt in without duplicating setup.
		const lenis = new Lenis({
			autoRaf: false,
			smoothWheel: true,
			gestureOrientation: "vertical",
		});

		let animationFrameId = 0;
		const onFrame = (time: number) => {
			lenis.raf(time);
			animationFrameId = window.requestAnimationFrame(onFrame);
		};

		// Lenis may not emit native scroll events — dispatch so scroll-linked UI (footer glow) updates.
		const onLenisScroll = () => {
			window.dispatchEvent(new Event("app-scroll"));
		};
		lenis.on("scroll", onLenisScroll);

		animationFrameId = window.requestAnimationFrame(onFrame);

		return () => {
			lenis.off("scroll", onLenisScroll);
			window.cancelAnimationFrame(animationFrameId);
			lenis.destroy();
		};
	}, []);

	return (
		<>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			<Toaster richColors />
		</>
	);
}
