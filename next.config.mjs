/** @type {import('next').NextConfig} */
const nextConfig = {
  // The app never uses next/image. Turning the optimizer off makes /_next/image
  // return 404, which closes the image-optimizer security advisories on Next 14.
  // See docs/nextjs-15-upgrade-plan.md.
  images: { unoptimized: true },
};

export default nextConfig;
