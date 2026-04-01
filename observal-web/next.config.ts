import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    // Server-side proxy: browser calls /api/* → Next.js server proxies to the API
    const apiUrl = process.env.API_INTERNAL_URL || "http://observal-api:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
