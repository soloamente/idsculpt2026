"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";

import { GradientWaveText } from "@/components/gradient-wave-text";

/** Easing from the reference preloader — strong ease-out for the curtain lift. */
const EXIT_EASE = [0.785, 0.135, 0.15, 0.86] as const;

/** How long the intro holds before the exit animation runs (matches reference). */
const PRELOADER_HOLD_MS = 2500;

/** Slide-up duration for the preloader panel (matches reference). */
const EXIT_DURATION_S = 1;

interface SitePreloaderProps {
	children: ReactNode;
}

/**
 * Intro minimale: pannello bianco con solo “Benvenuto”, poi swap (`y: "-100%"`).
 *
 * Il guscio esterno (altezza, overflow, sfondo) non deve cambiare mentre il pannello
 * è ancora in `exit`, altrimenti il contenitore si ri-layouta e il testo lampeggia.
 * Sblocchiamo il layout solo dopo `onExitComplete`.
 */
export function SitePreloader({ children }: SitePreloaderProps) {
	const prefersReducedMotion = useReducedMotion();
	const [showPreloader, setShowPreloader] = useState(true);
	/** `false` finché non termina l’animazione di uscita del preloader (o skip accessibilità). */
	const [preloaderGone, setPreloaderGone] = useState(false);

	useEffect(() => {
		if (prefersReducedMotion === true) {
			setShowPreloader(false);
			// Nessuna animazione d’uscita: sblocca subito il layout esterno.
			setPreloaderGone(true);
			return;
		}
		if (prefersReducedMotion === null) {
			return;
		}

		const timer = window.setTimeout(() => {
			setShowPreloader(false);
		}, PRELOADER_HOLD_MS);

		return () => window.clearTimeout(timer);
	}, [prefersReducedMotion]);

	// Mantieni clip + altezza fissa finché il pannello bianco non ha finito di uscire.
	const shellLocked = !preloaderGone;

	return (
		<div
			className={
				shellLocked
					? "relative h-svh w-full overflow-hidden bg-white"
					: "relative min-h-svh w-full overflow-x-hidden bg-background"
			}
		>
			<AnimatePresence
				initial={false}
				mode="popLayout"
				onExitComplete={() => {
					setPreloaderGone(true);
				}}
			>
				{showPreloader ? (
					<motion.div
						key="preloader"
						className="absolute inset-0 z-10 flex min-h-full w-full flex-col bg-white will-change-transform"
						initial={{ y: 0 }}
						exit={{ y: "-100%" }}
						transition={{ duration: EXIT_DURATION_S, ease: EXIT_EASE }}
					>
						<PreloaderPanel />
					</motion.div>
				) : (
					<motion.div
						key="main"
						className="min-h-svh w-full"
						// Nessun fade iniziale: evita lampeggi insieme alla tenda che sale.
						initial={false}
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

/** Solo testo centrato su sfondo bianco — fade-in CSS + gradient animato (`GradientWaveText`). */
function PreloaderPanel() {
	return (
		// `grid place-items-center` centra in orizzontale e verticale senza dipendere dall’altezza del flex child.
		<div className="grid min-h-svh w-full place-items-center bg-white px-6">
			{/* Opacità sul wrapper: il testo a clip gradient non anima bene con motion.opacity sul genitore. */}
			<div className="preloader-benvenuto-fade-in flex justify-center">
				<GradientWaveText
					align="center"
					// Senza offset il testo non è spostato dal padding/margin percentuale del gradiente radiale.
					bottomOffset={0}
					// `h-auto` evita che il box flex del componente si allarghi in altezza e “sposti” il centro visivo.
					className="h-auto w-auto max-w-full font-medium text-4xl uppercase tracking-tight [--gradient-wave-base:rgb(29,29,31)] sm:text-5xl dark:[--gradient-wave-base:rgb(29,29,31)]"
				>
					Benvenuto
				</GradientWaveText>
			</div>
		</div>
	);
}
