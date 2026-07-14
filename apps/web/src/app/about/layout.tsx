import {
	Archivo_Black,
	Bricolage_Grotesque,
	Fraunces,
	Instrument_Serif,
	Syne,
} from "next/font/google";

// Specimen faces for the About page vinyl word stickers — scoped to this route only.
const stickerArchivo = Archivo_Black({
	variable: "--font-sticker-archivo",
	subsets: ["latin"],
	weight: "400",
});

const stickerBricolage = Bricolage_Grotesque({
	variable: "--font-sticker-bricolage",
	subsets: ["latin"],
	weight: ["600"],
});

const stickerFraunces = Fraunces({
	variable: "--font-sticker-fraunces",
	subsets: ["latin"],
	weight: "500",
});

const stickerInstrument = Instrument_Serif({
	variable: "--font-sticker-instrument",
	subsets: ["latin"],
	weight: "400",
});

const stickerSyne = Syne({
	variable: "--font-sticker-syne",
	subsets: ["latin"],
	weight: ["700"],
});

const stickerFontVars = [
	stickerArchivo.variable,
	stickerBricolage.variable,
	stickerFraunces.variable,
	stickerInstrument.variable,
	stickerSyne.variable,
].join(" ");

export default function AboutLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <div className={`${stickerFontVars} w-full min-w-0`}>{children}</div>;
}
