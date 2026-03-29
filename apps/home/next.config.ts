import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.tamuu.id",
      },
      {
        protocol: "https",
        hostname: "tamuu.id",
      },
    ],
  },
};

export default nextConfig;
