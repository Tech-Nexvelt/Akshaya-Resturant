/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  transpilePackages: ["three"],
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable filesystem pack caching in dev to avoid V8 ArrayBuffer limit errors on heavy 3D packages
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
