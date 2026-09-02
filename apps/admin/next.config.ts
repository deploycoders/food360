import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@food360/theme"],
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["192.168.0.203"],
};

export default nextConfig;
