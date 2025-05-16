/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Old approach (deprecated)
    // domains: ['example.com'],
    
    // New approach (recommended)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      // Add more patterns as needed
    ],
  },
}

module.exports = nextConfig