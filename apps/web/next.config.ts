import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@b-core/ui", "@b-core/arc-engine"],
  async redirects() {
    return [{ source: "/winter-arc", destination: "/winter-arc/today", permanent: false }];
  },
};

export default nextConfig;
