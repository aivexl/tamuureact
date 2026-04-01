import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tamuu/shared"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
