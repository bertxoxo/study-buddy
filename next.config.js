/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sqlite3', 'sqlite', 'pdf-parse', 'better-sqlite3'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    config.externals = [...(config.externals || []), 'sqlite3', 'sqlite'];
    return config;
  },
}

module.exports = nextConfig