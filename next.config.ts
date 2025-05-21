import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // domains: ["ivpwvybbpejezeeqxsnn.supabase.co"], // Deprecated approach
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ivpwvybbpejezeeqxsnn.supabase.co', // Add your Supabase storage domain here
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;