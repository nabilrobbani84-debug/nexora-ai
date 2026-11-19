import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@nexora/shared'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
