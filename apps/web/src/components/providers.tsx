"use client";

import Lenis from "lenis";
import { Toaster } from "@idsculpt/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/utils/trpc";

export default function Providers({ children }: { children: React.ReactNode }) {
	useEffect(() => {
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
