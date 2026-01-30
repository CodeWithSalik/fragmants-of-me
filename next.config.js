/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
}

module.exports = nextConfig
