import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // تحسين أداء Hydration
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  // تجنب مشاكل Hydration
  reactStrictMode: true,
  // تكوين ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
