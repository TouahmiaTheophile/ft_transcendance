/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the standalone Docker production build
  output: 'standalone',

  // Allow importing from the shared package
  transpilePackages: ['shared'],

  // Enable polling for file watching inside Docker
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
