import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF where the browser takes it (about a fifth smaller), WebP otherwise.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
