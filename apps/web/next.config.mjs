/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@gm/blockchain-sdk"],
  experimental: {
    optimizePackageImports: ["lucide-react", "viem", "recharts"],
  },
  async rewrites() {
    return [
      {
        source: "/dashboard/:path+",
        destination: "/:path+",
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
      // Prevent server-side CDP SDK from failing client webpack resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        "@coinbase/cdp-sdk": false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "framerusercontent.com" },
      { protocol: "https", hostname: "i.imghippo.com" },
    ],
  },
  env: {
    APP_NAME: "GRAMBONDHON",
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1",
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453",
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  },
};

export default nextConfig;
