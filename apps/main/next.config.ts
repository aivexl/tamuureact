import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tamuu/shared"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/login',
        destination: 'https://tamuu-app.pages.dev/login',
      },
      {
        source: '/signup',
        destination: 'https://tamuu-app.pages.dev/signup',
      },
      {
        source: '/blog/:path*',
        destination: 'https://tamuu-app.pages.dev/blog/:path*',
      },
      {
        source: '/c/:path*',
        destination: 'https://tamuu-app.pages.dev/c/:path*',
      },
      {
        source: '/location/:path*',
        destination: 'https://tamuu-app.pages.dev/location/:path*',
      },
      {
        source: '/about',
        destination: 'https://tamuu-app.pages.dev/about',
      },
      {
        source: '/shop',
        destination: 'https://tamuu-app.pages.dev/shop',
      },
      {
        source: '/invitations/:path*',
        destination: 'https://tamuu-app.pages.dev/invitations/:path*',
      },
      {
        source: '/assets/:path*',
        destination: 'https://tamuu-app.pages.dev/assets/:path*',
      },
      {
        source: '/support/:path*',
        destination: 'https://tamuu-app.pages.dev/support/:path*',
      }
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "tamuu.id"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.tamuu.id' },
      { protocol: 'https', hostname: 'tamuu.id' }
    ],
  },
};

export default nextConfig;
