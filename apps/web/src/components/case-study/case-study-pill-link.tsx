import { cn } from "@idsculpt/ui/lib/utils";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

/** Dark glass pill used for “Return to projects” (Figma top-left control). */
const returnPillClassnames =
	"inline-flex items-center rounded-[39px] border border-black/10 bg-black/35 px-5 py-[15px] font-bold text-sm text-white uppercase backdrop-blur-[2px] transition-transform duration-150 ease-out [-webkit-tap-highlight-color:transparent] hover:scale-[0.98] active:scale-[0.96] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100";

interface CaseStudyPillLinkProps {
	href: string;
	children: ReactNode;
	className?: string;
}

/** Header-style pill link with square markers on case-study pages. */
export function CaseStudyPillLink({
	href,
	children,
	className,
}: CaseStudyPillLinkProps) {
	return (
		<Link className={cn(returnPillClassnames, className)} href={href as Route}>
			<span className="inline-flex items-center gap-2.5">
				<span aria-hidden className="size-2 shrink-0 bg-white" />
				{children}
			</span>
		</Link>
	);
}

/** Mailto CTA matching the footer stack on Figma project pages. */
export function CaseStudyEmailPill({ email }: { email: string }) {
	return (
		<a className={returnPillClassnames} href={`mailto:${email}`}>
			<span className="inline-flex items-center gap-2.5">
				<span aria-hidden className="size-2 shrink-0 bg-white" />
				Email us
				<span aria-hidden className="size-2 shrink-0 bg-white" />
			</span>
		</a>
	);
}
