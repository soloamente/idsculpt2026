import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import { FooterDiaGradient } from "@/components/footer-dia-gradient";
import Header from "@/components/header";
import Providers from "@/components/providers";
import { SitePreloader } from "@/components/site-preloader";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "idsculpt",
	description: "idsculpt",
};

/** Lets `env(safe-area-inset-*)` reach the real screen edges on iOS. */
export const viewport: Viewport = {
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					{/* Intro overlay (slide-up) then main shell — see `SitePreloader`. */}
					<SitePreloader>
						{/* Use min-height so pages can grow taller than viewport and remain scrollable. */}
						<div className="grid min-h-svh grid-rows-[auto_1fr]">
							<Header />
							{/* min-h-min: grid row grows with page content instead of clipping overflow. */}
							<div className="relative min-h-min w-full">{children}</div>
						</div>
						{/* Outside page `<main>` so overflow-hidden never clips the fixed glow. */}
						<FooterDiaGradient />
					</SitePreloader>
				</Providers>
			</body>
		</html>
	);
}
