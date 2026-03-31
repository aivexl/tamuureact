import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tamuu/shared"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: 'https://app.tamuu.id/login',
        permanent: false,
      },
      {
        source: '/signup',
        destination: 'https://app.tamuu.id/signup',
        permanent: false,
      },
      {
        source: '/dashboard/:path*',
        destination: 'https://app.tamuu.id/dashboard/:path*',
        permanent: false,
      },
      {
        source: '/onboarding',
        destination: 'https://app.tamuu.id/onboarding',
        permanent: false,
      },
      {
        source: '/profile',
        destination: 'https://app.tamuu.id/profile',
        permanent: false,
      },
      {
        source: '/billing',
        destination: 'https://app.tamuu.id/billing',
        permanent: false,
      },
      {
        source: '/upgrade',
        destination: 'https://app.tamuu.id/upgrade',
        permanent: false,
      },
      {
        source: '/editor/:path*',
        destination: 'https://app.tamuu.id/editor/:path*',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: 'https://app.tamuu.id/admin/:path*',
        permanent: false,
      }
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "tamuu.id", "app.tamuu.id"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.tamuu.id' },
      { protocol: 'https', hostname: 'tamuu.id' },
      { protocol: 'https', hostname: 'placehold.co' }
    ],
  },
};

export default nextConfig;
