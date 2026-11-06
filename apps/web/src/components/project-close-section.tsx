"use client";

import { cn } from "@idsculpt26/ui/lib/utils";

import { ContactSectionPills } from "@/components/contact-section-pills";
import { SkulletRevealOnView } from "@/components/skullet-reveal-on-view";

interface ProjectCloseSectionProps {
	heading: React.ReactNode;
	/** Optional supporting line; home keeps studio intro, work pages often omit it. */
	body?: React.ReactNode;
	/** Extra section classes, e.g. `project-close--with-next-dock` on case studies. */
	className?: string;
}

export function ProjectCloseSection({
	heading,
	body,
	className,
}: ProjectCloseSectionProps) {
	return (
		<section className={cn("project-close", className)}>
			<SkulletRevealOnView slow label="Loading contact section">
				<div className="project-close-grid">
					{heading}
					{body ?? null}
					<ContactSectionPills />
				</div>
			</SkulletRevealOnView>
		</section>
	);
}
