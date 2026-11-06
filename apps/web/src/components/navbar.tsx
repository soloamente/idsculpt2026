"use client";

import { cn } from "@idsculpt26/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ContactPanel } from "./contact-panel";

interface NavbarProps {
	// Text colour of the mark; the logo inherits it, so the team page can pass "text-white".
	className?: string;
	/** Studio intro under the nav row (home); hidden while contact panel is open. */
	studioIntro?: string;
}

const CONTACT_PANEL_ID = "navbar-contact-panel";

const navItemClassName =
	"inline-flex items-center rounded-md justify-center font-features-['ss01'_1] text-base leading-[19px] font-normal uppercase select-none";

interface NavLinkProps {
	href: "/" | "/team";
	pathname: string;
	children: React.ReactNode;
	onNavigate: () => void;
	"aria-label"?: string;
}

// Page link that plays the page push. On its own page it is marked current and does nothing,
// so the page never pushes in on top of itself.
function NavLink({
	href,
	pathname,
	children,
	onNavigate,
	"aria-label": ariaLabel,
}: NavLinkProps) {
	const isCurrent = pathname === href;

	return (
		<Link
			href={href}
			// "page-push" selects the push animation in both directions (see PageShell and index.css).
			transitionTypes={["page-push"]}
			aria-label={ariaLabel}
			aria-current={isCurrent ? "page" : undefined}
			onClick={(event) => {
				onNavigate();
				if (isCurrent) event.preventDefault();
			}}
			className={navItemClassName}
		>
			{children}
		</Link>
	);
}

// Every page owns its navbar (like pda.archi), so the header rides with its page during the push.
export function Navbar({ className, studioIntro }: NavbarProps) {
	const pathname = usePathname();
	const [isContactOpen, setIsContactOpen] = useState(false);
	const boxRef = useRef<HTMLDivElement>(null);
	const toggleRef = useRef<HTMLButtonElement>(null);
	const closeContact = () => setIsContactOpen(false);

	// Close the contact panel on Escape (focus goes back to the toggle) or on a press outside the navbar box.
	useEffect(() => {
		if (!isContactOpen) return;
		const handlePointerDown = (event: PointerEvent) => {
			if (!boxRef.current?.contains(event.target as Node))
				setIsContactOpen(false);
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			setIsContactOpen(false);
			toggleRef.current?.focus();
		};
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isContactOpen]);

	return (
		<header
			className={cn(
				"sticky top-0 z-10 flex w-full justify-center p-5",
				className,
			)}
		>
			{/* Without intro: fixed 39px + absolutely positioned box so only the bar height reserves layout while the contact panel overlays. With intro: flex-centred box is in-flow so the paragraph grows the sticky header. */}
			<div
				className={cn(
					"relative flex w-full justify-center",
					studioIntro ? undefined : "h-[39px]",
				)}
			>
				{/* Motion for the box, panel and content is keyed off data-state (see .navbar-box in index.css). */}
				<div
					ref={boxRef}
					data-state={isContactOpen ? "open" : "closed"}
					className={cn(
						"navbar-box flex flex-col bg-black p-2.5 text-white",
						isContactOpen ? "rounded-[10px]" : "rounded-md",
						studioIntro
							? "relative w-[min(65ch,calc(100vw-2.5rem))] max-w-none"
							: "absolute top-0 left-1/2 -translate-x-1/2",
					)}
				>
					<nav
						aria-label="Main"
						className="flex items-center justify-between gap-10"
					>
						<NavLink
							href="/"
							pathname={pathname}
							aria-label="Home"
							onNavigate={closeContact}
						>
							I/S
						</NavLink>
						<div className="flex items-center gap-4">
							<NavLink
								href="/team"
								pathname={pathname}
								onNavigate={closeContact}
							>
								Team
							</NavLink>
							<button
								ref={toggleRef}
								type="button"
								aria-expanded={isContactOpen}
								aria-controls={CONTACT_PANEL_ID}
								onClick={() => setIsContactOpen((open) => !open)}
								className={cn(navItemClassName, "cursor-pointer")}
							>
								contact
							</button>
						</div>
					</nav>

					{/* Same copy as the former home contact band; keep it out of the contact panel and hide when open. */}
					{studioIntro ? (
						<p
							className={cn(
								"mt-2.5 max-w-[65ch] text-left text-[11px] leading-[1.45] font-normal text-pretty text-white/65",
								isContactOpen && "hidden",
							)}
						>
							{studioIntro}
						</p>
					) : null}

					{/* Inert while closed so the panel's links stay out of the tab order and the accessibility tree. */}
					<div
						id={CONTACT_PANEL_ID}
						inert={!isContactOpen}
						className="navbar-panel"
					>
						<div className="min-h-0 overflow-hidden">
							<div className="pt-2.5">
								<ContactPanel open={isContactOpen} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
