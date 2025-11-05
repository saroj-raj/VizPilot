/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Allow loading images from any domain
  images: {
    domains: ['*'],
    unoptimized: true
  },
  // Disable static optimization for pages that use auth
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Force rebuild
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

module.exports = nextConfig
