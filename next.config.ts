import type { NextConfig } from "next";

// GitHub Pages serves this repo at https://<user>.github.io/Gnosenotis/,
// not from the domain root, so every internal link/asset needs that path
// prefix — that's what `basePath`/`assetPrefix` do below. Only apply it in
// production builds so `next dev` still runs at the plain localhost root.
const REPO_NAME = "Gnosenotis";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Static HTML export: no Node.js server, so the whole site is just files —
  // exactly what GitHub Pages (a static file host) can serve.
  output: "export",
  basePath: isProd ? `/${REPO_NAME}` : "",
  assetPrefix: isProd ? `/${REPO_NAME}/` : "",
  // Next's built-in Image component optimizes images through a server route,
  // which doesn't exist on a static host — this opts every <Image> back to
  // serving the original file untouched.
  images: { unoptimized: true },
};

export default nextConfig;
