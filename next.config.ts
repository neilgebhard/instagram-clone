import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'instagram-clone-neil-images.s3.us-west-2.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
