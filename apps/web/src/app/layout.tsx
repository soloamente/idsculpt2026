import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
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

/** Lets footer padding use `env(safe-area-inset-*)` on notched devices. */
export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
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
							{children}
						</div>
					</SitePreloader>
				</Providers>
			</body>
		</html>
	);
}
