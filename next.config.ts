import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ivpwvybbpejezeeqxsnn.supabase.co",
				pathname: "/**",
			},
		],
	},
	experimental: {
		serverActions: {
			bodySizeLimit: "25mb", // Set to 25MB for video uploads
		},
	},
};

export default nextConfig;
