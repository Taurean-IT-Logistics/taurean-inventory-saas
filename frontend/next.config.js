/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_BASENAME: process.env.NEXT_PUBLIC_BASENAME || '/',
    NEXT_PUBLIC_PORT: process.env.NEXT_PUBLIC_PORT || '3000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;