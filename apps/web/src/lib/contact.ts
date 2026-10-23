/** Primary studio email (matches contact section on the homepage). */
export const CONTACT_EMAIL = "work@identitysculpt.com";

/** Human-readable phone line (Italian format). */
export const CONTACT_PHONE_DISPLAY = "+39 373 774 2584";

/** E.164-style value for `tel:` links (spaces omitted). */
export const CONTACT_PHONE_TEL = "+393737742584";

/** WhatsApp click-to-chat for the same number (digits only, no leading +). */
export const CONTACT_WHATSAPP_HREF = `https://wa.me/${CONTACT_PHONE_TEL.replace(/\D/g, "")}`;
