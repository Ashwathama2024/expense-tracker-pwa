import type { NextConfig } from "next";

// Static export so the app can be hosted on GitHub Pages / Cloudflare Pages
// (plain HTML/CSS/JS over HTTPS — required for service worker + installability).
// If deploying to a GitHub Pages *project* site (username.github.io/repo-name),
// set NEXT_PUBLIC_BASE_PATH=/repo-name at build time.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
