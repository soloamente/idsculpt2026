import { CONTACT_EMAIL, CONTACT_PHONE_TEL } from "@/lib/contact";
/** Shared pill styling for contact section CTAs (email + phone). */
const contactPillClassnames =
	"inline-flex items-center rounded-full border border-black/10 bg-white/50 px-5 py-2.5 font-medium text-black text-sm uppercase backdrop-blur-sm transition-all duration-200 ease-out will-change-auto hover:scale-98 hover:opacity-50";

/**
 * Email + phone pills used in the contact band on homepage, gallery, and about.
 */
export function ContactSectionPills() {
	return (
		<div className="flex flex-wrap items-center justify-center gap-3">
			<a className={contactPillClassnames} href={`mailto:${CONTACT_EMAIL}`}>
				<span className="inline-flex items-center gap-1">
					<span aria-hidden className="size-[0.4em] shrink-0 bg-current" />
					Email Us
				</span>
			</a>
			<a className={contactPillClassnames} href={`tel:${CONTACT_PHONE_TEL}`}>
				<span className="inline-flex items-center gap-1">
					<span aria-hidden className="size-[0.4em] shrink-0 bg-current" />
					Call Us
				</span>
			</a>		</div>
	);
}
