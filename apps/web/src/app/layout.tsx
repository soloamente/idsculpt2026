import type { Metadata } from "next";
import Areal from "next/font/local";

import "../index.css";
import Providers from "@/components/providers";
import { SitePreloader } from "@/components/site-preloader";

const areal = Areal({
	src: "../../public/fonts/ABCArealSuperfamilyVariable.woff2",
	variable: "--font-areal",
	weight: "100 900",
	style: "normal",
});

export const metadata: Metadata = {
	title: "Identity Sculpt",
	description:
		"Identity Sculpt is a design studio that creates unique and memorable brand identities for businesses and organizations.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${areal.variable} antialiased`}>
				<Providers>
					<SitePreloader>{children}</SitePreloader>
				</Providers>
			</body>
		</html>
	);
}
