/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['f005.backblazeb2.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['axios']
  }
}

module.exports = nextConfig
