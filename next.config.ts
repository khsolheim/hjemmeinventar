import type { NextConfig } from "next";

// Bundle analyzer setup
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disabled to prevent constant reloading in development
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during Capacitor builds
    ignoreBuildErrors: process.env.CAPACITOR_BUILD === 'true',
  },
  // Capacitor configuration
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  trailingSlash: process.env.CAPACITOR_BUILD === 'true',
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Turbopack configuration
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  // Image optimization
  images: {
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.adlibris.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // PWA configuration (disabled in development for Turbopack compatibility)
  ...(process.env.NODE_ENV === 'production' && {
    // PWA settings for production builds only
    output: 'standalone',
  }),
};

export default withBundleAnalyzer(nextConfig);
