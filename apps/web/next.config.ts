import "@idsculpt/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "picsum.photos",
				pathname: "/**",
			},
		],
		// Dev: shorter TTL so swapped public/ assets refresh sooner via `/_next/image`.
		minimumCacheTTL:
			process.env.NODE_ENV === "development" ? 60 : undefined,
	},
};

export default nextConfig;
