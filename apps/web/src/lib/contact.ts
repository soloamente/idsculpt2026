/** Primary studio email (navbar contact panel and close-section pills). */
export const CONTACT_EMAIL = "info@identitysculpt.com";

/** Human-readable phone line (Italian format). */
export const CONTACT_PHONE_DISPLAY = "+39 373 774 2584";

/** E.164-style value for `tel:` links (spaces omitted). */
export const CONTACT_PHONE_TEL = "+393737742584";

/** WhatsApp click-to-chat for the same number (digits only, no leading +). */
export const CONTACT_WHATSAPP_HREF = `https://wa.me/${CONTACT_PHONE_TEL.replace(/\D/g, "")}`;

/**
 * Closing line under contact details in the navbar panel and in the home
 * project-close section so both stay aligned with brand copy.
 */
export const CONTACT_NOTE =
	"Every project starts with a conversation. Tell us about your brand, your timeline and what you would like to build.";
