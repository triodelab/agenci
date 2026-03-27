/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  /** Skjul Next.js dev-indikator (N) i iframe/forhåndsvisning */
  devIndicators: false,
}

export default nextConfig
