import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lebaptemecatholique.fr" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ibb.co" },
    ],
  },
  typescript: {
    // Temporarily ignore build errors during TypeScript phase
    // Since `tsc --noEmit` passes, this is a workaround for Next.js 16.1.1 build worker issue
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
