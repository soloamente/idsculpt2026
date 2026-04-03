"use client";

import { cn } from "@idsculpt/ui/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { HeaderTextMode } from "@/hooks/use-header-text-from-sections";
import {
	CONTACT_EMAIL,
	CONTACT_PHONE_DISPLAY,
	CONTACT_PHONE_TEL,
} from "@/lib/contact";

interface HeaderContactDesktopProps {
	headerTextMode: HeaderTextMode;
}

/**
 * Editorial “Contact” control: opens a minimal panel so visitors pick email or phone,
 * instead of a single ambiguous CTA.
 */
export function HeaderContactDesktop({
	headerTextMode,
}: HeaderContactDesktopProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const panelId = useId();

	// Close when clicking outside the trigger + panel (capture phase so it runs before link navigation).
	useEffect(() => {
		if (!open) return;
		const onPointerDown = (e: PointerEvent) => {
			const el = rootRef.current;
			if (!el?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown, true);
		return () =>
			document.removeEventListener("pointerdown", onPointerDown, true);
	}, [open]);

	// Escape closes the panel without affecting the mobile menu handler (both can listen).
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open]);

	// Mirrors section-driven header text: `light` → white nav over dark regions, so the panel inverts (black surface + white type); `dark` → black nav over light regions, panel stays paper-white + black type (no theme tokens).
	const panelSurface =
		headerTextMode === "light"
			? "border border-white/20 bg-black text-white shadow-xl backdrop-blur-md"
			: "border border-black/10 bg-white text-black shadow-xl backdrop-blur-sm";

	return (
		<div ref={rootRef} className="relative hidden md:block">
			<button
				type="button"
				aria-controls={panelId}
				aria-expanded={open}
				aria-haspopup="dialog"
				className={cn(
					"group inline-flex items-center gap-1.5 uppercase tracking-wide transition-opacity duration-200",
					// Hover: solo attenuazione del testo, nessuna sottolineatura / bordo.
					"hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/35",
				)}
				onClick={() => setOpen((v) => !v)}
			>
				Contact
				<ChevronDown
					aria-hidden
					className={cn(
						"size-4 opacity-80 transition-transform duration-200 ease-out",
						open && "rotate-180",
					)}
					strokeWidth={2}
				/>
			</button>

			{open ? (
				<div
					className={cn(
						"absolute top-full right-0 z-50 mt-3 w-[min(calc(100vw-2rem),17.5rem)] p-5",
						panelSurface,
					)}
					id={panelId}
					role="dialog"
					aria-label="Choose how to contact Identity Sculpt"
				>
					<p className="mb-4 font-normal text-[0.65rem] uppercase normal-case leading-relaxed tracking-[0.22em] opacity-70">
						By email or phone
					</p>
					<ul className="flex flex-col gap-5">
						<li>
							<p className="mb-1.5 text-[0.65rem] uppercase tracking-[0.18em] opacity-55">
								Email
							</p>
							<a
								className="block break-all border-current/25 border-b pb-1 font-normal text-base normal-case tracking-normal transition-opacity hover:opacity-80"
								href={`mailto:${CONTACT_EMAIL}`}
								onClick={() => setOpen(false)}
							>
								{CONTACT_EMAIL}
							</a>
						</li>
						<li>
							<p className="mb-1.5 text-[0.65rem] uppercase tracking-[0.18em] opacity-55">
								Phone
							</p>
							<a
								className="block border-current/25 border-b pb-1 font-normal text-base tabular-nums tracking-normal transition-opacity hover:opacity-80"
								href={`tel:${CONTACT_PHONE_TEL}`}
								onClick={() => setOpen(false)}
							>
								{CONTACT_PHONE_DISPLAY}
							</a>
						</li>
					</ul>
				</div>
			) : null}
		</div>
	);
}

interface HeaderContactMobileProps {
	/** Fires after choosing email or phone so the sheet can close (e.g. mobile menu). */
	onNavigate?: () => void;
}

/** Same choices as the desktop panel; mobile sheet is always white / black (see header). */
export function HeaderContactMobile({ onNavigate }: HeaderContactMobileProps) {
	return (
		<div className="mt-8 w-full max-w-sm border-black/15 border-t pt-10 text-black">
			<p className="mb-8 text-center font-normal text-[0.65rem] text-black/55 uppercase tracking-[0.22em]">
				Contact — email or phone
			</p>
			<div className="flex flex-col gap-8">
				<div className="text-center">
					<p className="mb-2 text-[0.65rem] text-black/55 uppercase tracking-[0.2em]">
						Email
					</p>
					<a
						className="inline-block border-black/30 border-b pb-1 font-normal text-[clamp(1rem,4vw,1.25rem)] text-black normal-case tracking-normal transition-opacity hover:opacity-80"
						href={`mailto:${CONTACT_EMAIL}`}
						onClick={() => onNavigate?.()}
					>
						{CONTACT_EMAIL}
					</a>
				</div>
				<div className="text-center">
					<p className="mb-2 text-[0.65rem] text-black/55 uppercase tracking-[0.2em]">
						Phone
					</p>
					<a
						className="inline-block border-black/30 border-b pb-1 font-normal text-[clamp(1rem,4vw,1.25rem)] text-black tabular-nums tracking-normal transition-opacity hover:opacity-80"
						href={`tel:${CONTACT_PHONE_TEL}`}
						onClick={() => onNavigate?.()}
					>
						{CONTACT_PHONE_DISPLAY}
					</a>
				</div>
			</div>
		</div>
	);
}
