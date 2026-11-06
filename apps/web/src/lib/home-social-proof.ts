/** Pull quote on the home page — real client reviews (Italian copy where supplied). */
export interface HomeReview {
	quote: string;
	person: string;
	/** Job title or descriptor (shown alone if `brand` is omitted). */
	role: string;
	/** Client or brand; omit when the line is role-only (e.g. “Entrepreneur”). */
	brand?: string;
}

/** Studio clients shown on the home page (name + one line). */
export interface HomeClient {
	name: string;
	line: string;
}

export const HOME_REVIEWS: readonly HomeReview[] = [
	{
		quote:
			"Ho acquistato un servizio di rebrand per la mia azienda e sono stato molto contento del servizio offerto, si tratta di professionisti capaci. Mi hanno veramente colpito, il livello è alto, super soddisfatto della qualità, tempi di consegna brevi e ottimi risultati. Consiglio.",
		person: "Giacomo Bertolazzi",
		role: "Founder",
		brand: "Meyou",
	},
	{
		quote:
			"Team disponibile e professionale, numerose richieste di siti progettati in pieno successo con tempi brevi, consigliati.",
		person: "Manuel Musarella",
		role: "Entrepreneur",
	},
	{
		quote:
			"Identità e materiali promo allineati: il marchio regge sia online che in gara. Tempi rispettati e team sempre presente.",
		person: "Luca Miraglino",
		role: "CEO",
		brand: "Chili Riders",
	},
] as const;

export const HOME_CLIENTS: readonly HomeClient[] = [
	{ name: "Oasis", line: "Brand identity" },
	{ name: "Navia", line: "Product UI and identity" },
	{ name: "Chili Riders", line: "Brand identity" },
] as const;
