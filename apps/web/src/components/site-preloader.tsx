"use client";

import { type ReactNode, useEffect, useState } from "react";

import { GradientWaveText } from "@/components/gradient-wave-text";

/** How long the intro holds before the curtain lifts (matches the previous site). */
const PRELOADER_HOLD_MS = 2500;

type Phase = "hold" | "exit" | "done";

interface SitePreloaderProps {
	children: ReactNode;
}

/**
 * White welcome curtain on entry. The shell stays viewport-locked until the
 * slide-up finishes, so the page underneath does not reflow while the panel
 * is still leaving.
 */
export function SitePreloader({ children }: SitePreloaderProps) {
	const [phase, setPhase] = useState<Phase>("hold");

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setPhase("done");
			return;
		}

		const timer = window.setTimeout(() => {
			setPhase("exit");
		}, PRELOADER_HOLD_MS);

		return () => window.clearTimeout(timer);
	}, []);

	const shellLocked = phase !== "done";

	return (
		<div
			className={
				shellLocked
					? "relative h-svh w-full overflow-hidden bg-white"
					: "relative min-h-svh w-full bg-white"
			}
		>
			{children}
			{phase === "done" ? null : (
				<div
					className={
						phase === "exit"
							? "preloader-curtain preloader-curtain-exit absolute inset-0 z-50 flex min-h-full w-full flex-col bg-white"
							: "preloader-curtain absolute inset-0 z-50 flex min-h-full w-full flex-col bg-white"
					}
					onAnimationEnd={(event) => {
						// The word's fade-in bubbles through this node. Only the curtain unlocks the page.
						if (event.target !== event.currentTarget) return;
						setPhase("done");
					}}
				>
					<PreloaderPanel />
				</div>
			)}
		</div>
	);
}

/** Centred WELCOME on white — CSS fade, then the gradient sweep. */
function PreloaderPanel() {
	return (
		<div className="grid min-h-svh w-full place-items-center bg-white px-6">
			<div className="preloader-benvenuto-fade-in flex justify-center">
				<GradientWaveText className="text-4xl font-medium tracking-tight uppercase [--gradient-wave-base:rgb(29,29,31)] sm:text-5xl">
					WELCOME
				</GradientWaveText>
			</div>
		</div>
	);
}
