import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The app never uses next/image. Turning the optimizer off makes /_next/image
  // return 404, which closes the image-optimizer security advisories on Next 14.
  // See docs/nextjs-15-upgrade-plan.md.
  images: { unoptimized: true },
  // This folder is the project. Without this, a stray package-lock.json higher up
  // (e.g. in the home folder) makes Next.js treat that folder as the root.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
