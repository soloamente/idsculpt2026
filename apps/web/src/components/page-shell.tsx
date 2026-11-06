import { cn } from "@idsculpt26/ui/lib/utils";
import { ViewTransition } from "react";

import { Navbar } from "@/components/navbar";

interface PageShellProps {
	children: React.ReactNode;
	// Classes for the page root (background, height...). Defaults to a white page.
	className?: string;
	// Text colour of the navbar mark.
	navbarClassName?: string;
}

// Only tagged navigations animate. Everything else (browser back, router.refresh(), Suspense reveals)
// swaps without motion. Enter and exit use different classes so index.css can stack the incoming page
// above the outgoing one.
// "page-push" — navbar and work cards: the next page drops in from above.
// "page-rise" — the next-project card: the next page rises from the bottom.
const PUSH_ENTER = {
	"page-push": "page-push-in",
	"page-rise": "page-rise-in",
	default: "none",
} as const;
const PUSH_EXIT = {
	"page-push": "page-push-out",
	"page-rise": "page-rise-out",
	default: "none",
} as const;

// One full page with its own navbar. It lives in each page.tsx, not the layout: layouts persist across
// navigations, so enter and exit would never fire there.
export function PageShell({
	children,
	className,
	navbarClassName,
}: PageShellProps) {
	return (
		<ViewTransition enter={PUSH_ENTER} exit={PUSH_EXIT} default="none">
			<div
				data-page-shell=""
				className={cn(
					"relative grid min-h-svh w-screen min-w-0 grid-rows-[auto_1fr] bg-white",
					className,
				)}
			>
				<Navbar className={navbarClassName} />
				{/* flex-1 + column so children (e.g. /team) can flex-fill below the navbar and vertically center. */}
				<div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-x-clip">
					{children}
				</div>
			</div>
		</ViewTransition>
	);
}
