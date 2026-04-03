"use client";

import Lenis from "lenis";
import { Toaster } from "@idsculpt/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
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

		animationFrameId = window.requestAnimationFrame(onFrame);

		return () => {
			window.cancelAnimationFrame(animationFrameId);
			lenis.destroy();
		};
	}, []);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			// Use an app-specific key so old "theme" values from other local apps
			// don't override this project's intended default.
			storageKey="idsculpt-theme"
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
