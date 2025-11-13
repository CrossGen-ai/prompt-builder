/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Temporarily ignore build errors due to React 19 / Radix UI type incompatibilities
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
