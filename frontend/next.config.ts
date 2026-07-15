import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: "http://backend:3000/auth/:path*",
      },
      {
        source: "/users/:path*",
        destination: "http://backend:3000/users/:path*",
      },
      {
        source: "/friends/:path*",
        destination: "http://backend:3000/friends/:path*",
      },
      {
        source: "/conversations/:path*",
        destination: "http://backend:3000/conversations/:path*",
      }
    ]
  },
};

export default nextConfig;
