import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@b-core/ui", "@b-core/arc-engine"],
};

export default nextConfig;
