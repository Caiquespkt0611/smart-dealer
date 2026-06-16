import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude .ts from pageExtensions so middleware.ts (deprecated) and
  // proxy.ts (placeholder) aren't detected alongside proxy.tsx (the real one).
  pageExtensions: ['js', 'jsx', 'tsx'],
};

export default nextConfig;
