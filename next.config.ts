import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true,
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  compress: true,
  poweredByHeader: false,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  }
};

export default nextConfig;
