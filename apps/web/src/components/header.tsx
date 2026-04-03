"use client";

import { cn } from "@idsculpt/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
	HeaderContactDesktop,
	HeaderContactMobile,
} from "@/components/header-contact";
import { useHeaderTextFromSections } from "@/hooks/use-header-text-from-sections";

/** Past this scroll offset (px) we allow hide-on-scroll-down behavior. */
const SCROLL_AWAY_THRESHOLD_PX = 64;

export default function Header() {
	const pathname = usePathname();
	const headerTextMode = useHeaderTextFromSections();
	/** When true, header fades out (scroll down past threshold); scroll up reveals it again. */
	const [isHeaderHidden, setIsHeaderHidden] = useState(false);
	/** Mobile full-screen top sheet: open/closed (nav + contact live here on small screens). */
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const lastScrollYRef = useRef(0);
	const prefersReducedMotion = useReducedMotion();

	const navigation = [
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About" },
		{ href: "/gallery", label: "Gallery" },
	];

	// Track scroll direction: hide after passing threshold when scrolling down; show on any scroll up (or near top).
	useEffect(() => {
		lastScrollYRef.current =
			window.scrollY ?? document.documentElement.scrollTop;

		const onScroll = () => {
			const current = window.scrollY ?? document.documentElement.scrollTop;
			const previous = lastScrollYRef.current;

			if (current <= SCROLL_AWAY_THRESHOLD_PX) {
				setIsHeaderHidden(false);
			} else if (current > previous) {
				setIsHeaderHidden(true);
			} else if (current < previous) {
				setIsHeaderHidden(false);
			}

			lastScrollYRef.current = current;
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Close the mobile menu after navigation so the next page does not keep the drawer open.
	// biome-ignore lint/correctness/useExhaustiveDependencies: effect must re-run when `pathname` changes
	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, [pathname]);

	// Escape closes the drawer; avoids trapping keyboard users without a visible close control.
	useEffect(() => {
		if (!isMobileMenuOpen) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsMobileMenuOpen(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isMobileMenuOpen]);

	// Prevent background scroll while the mobile drawer is open.
	useEffect(() => {
		if (!isMobileMenuOpen) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [isMobileMenuOpen]);

	const navClassnames =
		"transition-all duration-200 hover:scale-98 hover:opacity-50 will-change-auto";
	return (
		<header
			className={cn(
				"pointer-events-auto fixed top-0 right-0 left-0 z-40 flex w-screen justify-center transition-opacity duration-200 ease-out",
				// Keep interactions disabled while invisible so the bar does not block clicks.
				// When the mobile drawer is open, stay visible and interactive even if scroll hid the bar.
				isHeaderHidden && !isMobileMenuOpen && "pointer-events-none opacity-0",
				isMobileMenuOpen && "z-50 opacity-100",
			)}
		>
			{/* text-sm on small screens; scale up on md+ and again on large desktops for readability. */}
			<div className="relative mt-4 w-full bg-transparent p-4 px-8 text-sm uppercase shadow-neutral-500/5 md:text-base lg:text-lg">
				<div
					className={cn(
						"relative flex items-center justify-between transition-colors duration-200 ease-out",
						headerTextMode === "light" ? "text-white" : "text-black",
					)}
				>
					<h1 className="font-bold">iDentity Sculpt</h1>

					{/* Desktop: same row as before — nav and contact are separate flex items with justify-between on the row. */}
					<nav className="hidden items-center gap-4 md:flex">
						{navigation.map((item) => (
							<Link
								key={item.href}
								className={cn(
									navClassnames,
									pathname === item.href
										? "font-bold"
										: "font-medium will-change-auto",
								)}
								href={item.href as Route<string>}
							>
								{item.label}
							</Link>
						))}
					</nav>
					<HeaderContactDesktop headerTextMode={headerTextMode} />

					{/* Mobile: icon-only control on the right; nav opens as a top sheet with centered links. */}
					<div className="flex md:hidden">
						<button
							type="button"
							className={cn(
								"-mr-2 inline-flex min-h-11 min-w-11 select-none items-center justify-center rounded-md p-2 uppercase [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40",
								headerTextMode === "light" ? "text-white" : "text-black",
							)}
							aria-controls="header-mobile-nav"
							aria-expanded={isMobileMenuOpen}
							aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
							onClick={() => setIsMobileMenuOpen((open) => !open)}
						>
							{isMobileMenuOpen ? (
								<X aria-hidden className="size-6" strokeWidth={2} />
							) : (
								<Menu aria-hidden className="size-6" strokeWidth={2} />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile-only: backdrop fades; full-width sheet animates down from the top; links are large and centered. */}
			<AnimatePresence>
				{isMobileMenuOpen ? (
					<>
						{/* Backdrop: lower stack order; tap closes. Must be a direct keyed child of AnimatePresence for exit fade. */}
						<motion.button
							key="header-mobile-backdrop"
							type="button"
							animate={{ opacity: 1 }}
							aria-label="Close menu"
							className="fixed inset-0 z-50 bg-black/40 [-webkit-tap-highlight-color:transparent] md:hidden"
							exit={{ opacity: 0 }}
							initial={{ opacity: 0 }}
							transition={
								prefersReducedMotion
									? { duration: 0 }
									: { duration: 0.2, ease: "easeOut" }
							}
							onClick={() => setIsMobileMenuOpen(false)}
						/>
						{/* Top sheet: slides from y = -100% so the menu visibly drops in from above. */}
						<motion.div
							key="header-mobile-sheet"
							animate={{ y: 0 }}
							className={
								// Mobile menu is always light paper + black type (no section / theme coupling).
								"fixed inset-x-0 top-0 z-60 flex min-h-dvh select-none flex-col bg-white text-black shadow-lg md:hidden"
							}
							exit={{ y: "-100%" }}
							id="header-mobile-nav"
							initial={{ y: "-100%" }}
							role="dialog"
							aria-modal="true"
							aria-label="Site navigation"
							transition={
								prefersReducedMotion
									? { duration: 0 }
									: { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
							}
						>
							<div className="flex items-center justify-end p-4 pt-[max(1rem,env(safe-area-inset-top))]">
								<button
									type="button"
									className={cn(
										"inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-black [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40",
									)}
									aria-label="Close menu"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<X aria-hidden className="size-7" strokeWidth={2} />
								</button>
							</div>
							<nav className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
								{navigation.map((item) => (
									<Link
										key={item.href}
										className={cn(
											"w-full max-w-sm rounded-md py-3 text-center font-medium text-black uppercase tracking-wide transition-colors",
											// Large, fluid type so titles read as the hero of the overlay.
											"text-[clamp(1.75rem,7vw,2.75rem)] leading-tight",
											pathname === item.href
												? "font-semibold opacity-100"
												: "opacity-90 hover:opacity-100",
										)}
										href={item.href as Route<string>}
										onClick={() => setIsMobileMenuOpen(false)}
									>
										{item.label}
									</Link>
								))}
								<HeaderContactMobile
									onNavigate={() => setIsMobileMenuOpen(false)}
								/>
							</nav>
						</motion.div>
					</>
				) : null}
			</AnimatePresence>
		</header>
	);
}
