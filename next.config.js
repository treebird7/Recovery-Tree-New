/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for mobile builds
  output: process.env.BUILD_MODE === 'mobile' ? 'export' : undefined,
  images: {
    unoptimized: process.env.BUILD_MODE === 'mobile' ? true : false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
