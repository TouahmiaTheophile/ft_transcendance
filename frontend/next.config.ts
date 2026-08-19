import type { NextConfig } from "next";

/**
 * Next 16 returns 403 on /_next/* when the origin isn't the one the dev server
 * started on (localhost) — even same-origin through nginx, since it's the
 * hostname that counts. Without a whitelist, opening the site from another
 * machine loads no chunks: the page renders, React never hydrates, <form>
 * elements fall back to a native submit (GET /login?) and nothing responds.
 *
 * DEV_ORIGINS is filled by the Makefile (hostname + LAN IPs), overridable in
 * .env. No effect in production.
 */

const devOrigins = (process.env.DEV_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  allowedDevOrigins: Array.from(
    new Set(["localhost", "127.0.0.1", "[::1]", ...devOrigins]),
  ),
};

export default nextConfig;