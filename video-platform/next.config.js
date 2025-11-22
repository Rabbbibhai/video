/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['f005.backblazeb2.com'],
  },
}

module.exports = nextConfig