import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile images
      },
      {
        protocol: "https",
        hostname: "arubdytjouirrowpaiog.supabase.co", // Supabase Storage
      },
    ],
  },
};

export default nextConfig;
