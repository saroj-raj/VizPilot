/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Allow loading images from any domain
  images: {
    domains: ['*'],
    unoptimized: true
  },
  // Standalone output for deployment
  output: 'standalone'
}

module.exports = nextConfig
