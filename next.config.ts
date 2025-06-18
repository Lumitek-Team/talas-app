const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.clerk.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "ivpwvybbpejezeeqxsnn.supabase.co",
				pathname: "/storage/v1/object/public/**",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com", // For Google account photos
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com", // For GitHub account photos
			},
			{
				protocol: "http",
				hostname: "localhost",
				port: "3000", // Default port for local development
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
