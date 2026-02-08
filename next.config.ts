import type { NextConfig } from "next";

// For GitHub Pages: use repo name. Use '' if deploying to username.github.io (user site).
const basePath = "/MealTime";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
