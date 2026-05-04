// Security headers for production
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Prevent indexing of preview deployments on Vercel
  {
    key: "X-Robots-Tag",
    value:
      process.env.VERCEL_ENV === "preview"
        ? "noindex, nofollow"
        : "index, follow",
  },
];

const supabaseHostname = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "https://znmzfbfdlqxrvebilche.supabase.co",
).hostname;

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/storage/:path*",
        destination: "/public/storage/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: supabaseHostname,
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
