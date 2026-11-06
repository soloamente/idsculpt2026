"use client";

import { Toaster } from "@idsculpt26/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Agentation } from "agentation";
import Lenis from "lenis";
import { useEffect, useState } from "react";
import { SkulletProvider } from "skullet/react";

import { setLatestScrollY } from "@/lib/scroll-bridge";
import { getQueryClient, makeTRPCClient, TRPCProvider } from "@/utils/trpc";

import { skulletReveal, skulletTheme } from "./skullet-config";
import { ThemeProvider } from "./theme-provider";

const SCROLL_KEYS = new Set([
	" ",
	"PageUp",
	"PageDown",
	"Home",
	"End",
	"ArrowUp",
	"ArrowDown",
]);

/**
 * The page push animates a `::view-transition-group` that is positioned against
 * the document. A scroll while it runs adds that delta to the group's transform,
 * so the slide leaves the screen while its timeline keeps going. When the
 * timeline ends the live page is already in place. Swallow scroll input for the
 * whole transition, and pin the scroll offset once `ready` fires — that is after
 * Next has moved the new page to the top, and before the push is on screen.
 */
function holdScrollForViewTransitions(lenis: Lenis | null): () => void {
	const proto = Document.prototype as Document & {
		startViewTransition: (update: unknown) => ViewTransition;
	};
	const original = proto.startViewTransition;
	if (typeof original !== "function") return () => {};

	const blockWheel = (event: WheelEvent) => {
		event.preventDefault();
	};
	const blockTouch = (event: TouchEvent) => {
		if (event.cancelable) event.preventDefault();
	};
	const blockKeys = (event: KeyboardEvent) => {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		if (SCROLL_KEYS.has(event.key)) event.preventDefault();
	};

	proto.startViewTransition = function holdScrollDuringViewTransition(
		this: Document,
		update: unknown,
	) {
		lenis?.stop();
		window.addEventListener("wheel", blockWheel, {
			capture: true,
			passive: false,
		});
		window.addEventListener("touchmove", blockTouch, {
			capture: true,
			passive: false,
		});
		window.addEventListener("keydown", blockKeys, { capture: true });

		let frozenY = 0;
		let pinning = false;
		let released = false;
		const pinScroll = () => {
			if (!pinning) return;
			if (window.scrollY !== frozenY) window.scrollTo(0, frozenY);
		};
		const release = () => {
			if (released) return;
			released = true;
			pinning = false;
			document.documentElement.classList.remove("view-transition-lock");
			window.removeEventListener("scroll", pinScroll);
			window.removeEventListener("wheel", blockWheel, { capture: true });
			window.removeEventListener("touchmove", blockTouch, { capture: true });
			window.removeEventListener("keydown", blockKeys, { capture: true });
			lenis?.start();
		};

		let transition: ViewTransition;
		try {
			transition = original.call(this, update);
		} catch (error) {
			release();
			throw error;
		}

		transition.ready.then(() => {
			// The new page has already been scrolled to the top inside the update
			// callback. Pin that offset for the rest of the push.
			frozenY = window.scrollY;
			pinning = true;
			document.documentElement.classList.add("view-transition-lock");
			window.addEventListener("scroll", pinScroll, { passive: true });
		}, release);
		transition.finished.finally(release);
		return transition;
	};

	return () => {
		proto.startViewTransition = original;
	};
}

/**
 * Smooth scroll on desktop only — same rules as idsculpt2026: skip touch / coarse
 * pointers and reduced motion; bridge `app-scroll` for scroll-linked UI (carousel, dock).
 */
function shouldUseLenis(): boolean {
	if (typeof window === "undefined") return false;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
	if (window.matchMedia("(pointer: coarse)").matches) return false;
	if (!window.matchMedia("(hover: hover)").matches) return false;
	return true;
}

export default function Providers({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	const [trpcClient] = useState(makeTRPCClient);

	useEffect(() => {
		const emitAppScroll = () => {
			window.dispatchEvent(new Event("app-scroll"));
		};

		if (!shouldUseLenis()) {
			const onNativeScroll = () => {
				setLatestScrollY(
					window.scrollY ??
						document.documentElement.scrollTop ??
						document.body.scrollTop ??
						0,
				);
				emitAppScroll();
			};
			onNativeScroll();
			window.addEventListener("scroll", onNativeScroll, { passive: true });
			const releaseViewTransitionScroll = holdScrollForViewTransitions(null);
			return () => {
				window.removeEventListener("scroll", onNativeScroll);
				releaseViewTransitionScroll();
			};
		}

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

		const onLenisScroll = (instance: Lenis) => {
			setLatestScrollY(instance.scroll);
			emitAppScroll();
		};
		lenis.on("scroll", onLenisScroll);

		animationFrameId = window.requestAnimationFrame(onFrame);
		const releaseViewTransitionScroll = holdScrollForViewTransitions(lenis);

		return () => {
			releaseViewTransitionScroll();
			lenis.off("scroll", onLenisScroll);
			window.cancelAnimationFrame(animationFrameId);
			lenis.destroy();
		};
	}, []);

	return (
		// The site is designed light-only and pages hard-code their own surfaces, so the theme is forced:
		// following the OS would flip token-based parts (navbar, contact panel) dark on dark-mode devices only.
		<ThemeProvider
			attribute="class"
			forcedTheme="light"
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>
				<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
					<SkulletProvider
						mode="system"
						reveal={skulletReveal}
						theme={skulletTheme}
					>
						{children}
						{process.env.NODE_ENV === "development" && <Agentation />}
					</SkulletProvider>
				</TRPCProvider>
			</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
