"use client";

import { type CSSProperties, useEffect, useState } from "react";

import {
	CONTACT_EMAIL,
	CONTACT_NOTE,
	CONTACT_PHONE_DISPLAY,
	CONTACT_WHATSAPP_HREF,
} from "@/lib/contact";

const INSTAGRAM_URL = "https://www.instagram.com/idsculpt/";

// Panel copy (navbar contact state): "We are based in Italy." stays fixed per brand.
const ITALY_HEADLINE = "We are based in Italy.";
const ITALY_SUBTEXT = "Our studio works on Italian business hours.";
// Rome wall-clock time split into parts so each segment can carry its own opacity, as in the design.
const romeTimeFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: "Europe/Rome",
	hour: "numeric",
	minute: "2-digit",
	second: "2-digit",
	hour12: true,
});

interface RomeTime {
	hour: string;
	minute: string;
	second: string;
	dayPeriod: string;
}

function getRomeTime(): RomeTime {
	const parts = romeTimeFormat.formatToParts(new Date());
	const part = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((p) => p.type === type)?.value ?? "";
	return {
		hour: part("hour"),
		minute: part("minute"),
		second: part("second"),
		dayPeriod: part("dayPeriod"),
	};
}

// Ticks only while the panel is open; starts empty so server and client markup match.
function RomeClock({ isActive }: { isActive: boolean }) {
	const [time, setTime] = useState<RomeTime | null>(null);

	useEffect(() => {
		if (!isActive) return;
		const tick = () => setTime(getRomeTime());
		tick();
		const interval = window.setInterval(tick, 1000);
		return () => window.clearInterval(interval);
	}, [isActive]);

	return (
		<p
			className="navbar-reveal w-[222px] text-xs tabular-nums"
			style={revealStyle(1)}
		>
			<span>{time?.hour ?? "--"}</span>
			<span className="text-white/60">:{time?.minute ?? "--"}</span>
			<span className="text-white/30">:{time?.second ?? "--"}</span>{" "}
			<span className="text-white/50">{time?.dayPeriod ?? ""}, Rome</span>
		</p>
	);
}

interface ContactPanelProps {
	open: boolean;
}

// Stagger order (and optional rise distance) for a `.navbar-reveal` block; the timing lives in index.css.
function revealStyle(index: number, rise?: string): CSSProperties {
	return { "--i": index, ...(rise ? { "--rise": rise } : {}) } as CSSProperties;
}

// Body of the navbar's "contact" state (Figma IDSC - WEB, node 1013:146); the navbar supplies the black box around it.
export function ContactPanel({ open }: ContactPanelProps) {
	return (
		<div className="flex w-[295px] flex-col gap-[5px] font-medium">
			{/* Fixed gaps instead of a fixed height, so longer copy grows the panel rather than squeezing the spacing. */}
			<div className="flex flex-col items-start gap-5">
				<div className="navbar-reveal w-full text-xs" style={revealStyle(0)}>
					<p>{ITALY_HEADLINE}</p>
					<p className="text-white/50">{ITALY_SUBTEXT}</p>
				</div>

				<RomeClock isActive={open} />

				<div className="flex flex-col items-start gap-3.5">
					<div
						className="navbar-reveal flex flex-col gap-[5px] text-[10.2px]"
						style={revealStyle(2)}
					>
						<p className="flex items-center gap-[8.5px]">
							<span className="opacity-50">Email</span>
							<a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">
								{CONTACT_EMAIL}
							</a>
						</p>
						<p className="flex items-center gap-[8.5px]">
							<span className="opacity-50">WhatsApp</span>
							<a
								href={CONTACT_WHATSAPP_HREF}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:underline"
							>
								{CONTACT_PHONE_DISPLAY}
							</a>
						</p>
						<p className="flex items-center gap-[8.5px]">
							<span className="opacity-50">Instagram</span>
							<a
								href={INSTAGRAM_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:underline"
							>
								@idsculpt
							</a>
						</p>
					</div>
					<p
						className="navbar-reveal w-full text-xs leading-[1.4] text-pretty text-white/50"
						style={revealStyle(3)}
					>
						{CONTACT_NOTE}
					</p>
				</div>
			</div>

			{/* I/S wordmark with the statue screened into the gap between the letters. */}
			<div
				className="navbar-reveal relative h-[110px] w-[295px] shrink-0"
				style={revealStyle(4, "12px")}
				aria-hidden="true"
			>
				{/* biome-ignore lint/performance/noImgElement: static decorative SVG */}
				<img
					src="/contact/statue.svg"
					alt=""
					width={111.387}
					height={109.028}
					className="absolute top-[0.79px] left-[73.26px] mix-blend-screen"
				/>
				{/* biome-ignore lint/performance/noImgElement: static decorative SVG */}
				<img
					src="/contact/is-mark.svg"
					alt=""
					width={295}
					height={110}
					className="absolute inset-0"
				/>
			</div>
		</div>
	);
}
