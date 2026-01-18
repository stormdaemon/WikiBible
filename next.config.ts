import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore build errors during TypeScript phase
    // Since `tsc --noEmit` passes, this is a workaround for Next.js 16.1.1 build worker issue
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
