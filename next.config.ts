import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Organizer avatars are served from Bevy's Cloudinary account.
    remotePatterns: [new URL("https://res.cloudinary.com/startup-grind/image/upload/**")],
  },
};

export default nextConfig;
