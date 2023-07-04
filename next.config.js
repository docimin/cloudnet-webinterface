/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['cdn.discordapp.com', 'fayevr.dev', 'fayevr-dev.pages.dev'],
    },
    experimental: {
      appDir: true,
    },
}

module.exports = nextConfig
