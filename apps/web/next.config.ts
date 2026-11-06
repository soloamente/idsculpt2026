import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	// Browsers request /favicon.ico before they read the icon link.
	// The mark is public/favicon.png, so that request should serve the same file.
	async rewrites() {
		return [{ source: "/favicon.ico", destination: "/favicon.png" }];
	},
};

export default withVarlock(nextConfig);
