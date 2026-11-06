import { navPillClassName } from "@/components/nav-pill";
import { CONTACT_EMAIL, CONTACT_WHATSAPP_HREF } from "@/lib/contact";

/**
 * Email + WhatsApp actions in the “Let’s work together” band (home and case studies).
 */
export function ContactSectionPills() {
	return (
		<div className="flex flex-wrap items-center justify-center gap-4">
			<a className={navPillClassName} href={`mailto:${CONTACT_EMAIL}`}>
				Email Us
			</a>
			<a
				className={navPillClassName}
				href={CONTACT_WHATSAPP_HREF}
				target="_blank"
				rel="noopener noreferrer"
			>
				WhatsApp
			</a>
		</div>
	);
}
