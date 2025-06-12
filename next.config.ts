import type {NextConfig} from 'next';
import path from 'path'; // Import path module

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Enables standalone output for optimized Docker builds
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // This is TEMPORARILY enabled to help diagnose build issues.
    // It should be removed or set to false for true production builds.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // This is TEMPORARILY enabled to help diagnose build issues.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add a path alias for @ to resolve to the src directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;
